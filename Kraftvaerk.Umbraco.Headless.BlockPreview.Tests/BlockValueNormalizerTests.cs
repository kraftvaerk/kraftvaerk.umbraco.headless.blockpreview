using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Tests.Support;
using Newtonsoft.Json.Linq;
using Xunit;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Tests;

/// <summary>
/// The normalizer is the pure core of the JSON translation; these tests hit it without any Umbraco mocks.
/// </summary>
public class BlockValueNormalizerTests
{
    private static readonly Guid Outer = Guid.Parse("00000000-0000-0000-0000-00000000aaaa");
    private static readonly Guid Inner = Guid.Parse("00000000-0000-0000-0000-00000000bbbb");

    private static string? EditorFor(Guid type, string alias) => (type, alias) switch
    {
        (_, "picker") => BlockValueNormalizer.MultiNodeTreePickerEditor,
        (_, "price") => BlockValueNormalizer.DecimalEditor,
        (_, "blocks") => "Umbraco.BlockList",
        _ => "Umbraco.TextBox",
    };

    private static BlockValueNormalizer Create() => new(EditorFor);

    [Fact]
    public void Scalars_pass_through_as_clr_values_and_structures_as_json_text()
    {
        var block = JObject.Parse("""{ "text": "hi", "count": 3, "ratio": 1.5, "on": false, "empty": null, "list": [1,2], "obj": { "a": 1 } }""");

        var (json, values) = Create().Normalize(block, Outer);

        Assert.Equal("hi", values["text"]);
        Assert.Equal(3L, values["count"]);
        Assert.Equal(1.5, values["ratio"]);
        Assert.Equal(false, values["on"]);
        Assert.Null(values["empty"]);
        Assert.Equal("[1,2]", values["list"]);
        Assert.Equal("{\"a\":1}", values["obj"]);
        Assert.Equal(JTokenType.Object, json["obj"]!.Type); // the JSON side keeps structure for patching
    }

    [Fact]
    public void Input_is_not_mutated()
    {
        var block = JObject.Parse("""{ "picker": [{ "type": "document", "unique": "2c9d3b9b-8a4e-4f0d-9d3e-3b1b3d3c9a01" }] }""");
        var before = block.ToString();

        Create().Normalize(block, Outer);

        Assert.Equal(before, block.ToString());
    }

    [Theory]
    [InlineData("5", "5.0")]
    [InlineData("5.25", "5.25")]
    [InlineData("-2", "-2.0")]
    public void Decimal_strings_and_numbers_get_a_fraction(string input, string expected)
    {
        var (_, fromString) = Create().Normalize(new JObject { ["price"] = input }, Outer);
        var (_, fromNumber) = Create().Normalize(JObject.Parse($$"""{ "price": {{input}} }"""), Outer);

        Assert.Equal(expected, fromString["price"]);
        Assert.Equal(expected, fromNumber["price"]);
    }

    [Fact]
    public void Non_numeric_decimal_input_is_left_alone()
    {
        var (_, values) = Create().Normalize(new JObject { ["price"] = "n/a", ["price2"] = JValue.CreateNull() }, Outer);

        Assert.Equal("n/a", values["price"]);
    }

    [Fact]
    public void Picker_items_become_udi_csv_in_compact_guid_form()
    {
        var block = JObject.Parse("""
            { "picker": [
                { "type": "document", "unique": "2c9d3b9b-8a4e-4f0d-9d3e-3b1b3d3c9a01" },
                { "type": "media", "unique": "6a1e276c-bdb1-4c76-a4d8-3d4ef61a09b5" } ] }
            """);

        var (_, values) = Create().Normalize(block, Outer);

        Assert.Equal("umb://document/2c9d3b9b8a4e4f0d9d3e3b1b3d3c9a01,umb://media/6a1e276cbdb14c76a4d83d4ef61a09b5", values["picker"]);
    }

    [Fact]
    public void Picker_items_sent_as_a_json_string_are_converted_too()
    {
        var block = new JObject { ["picker"] = "[{\"type\":\"document\",\"unique\":\"2c9d3b9b-8a4e-4f0d-9d3e-3b1b3d3c9a01\"}]" };

        var (_, values) = Create().Normalize(block, Outer);

        Assert.Equal("umb://document/2c9d3b9b8a4e4f0d9d3e3b1b3d3c9a01", values["picker"]);
    }

    [Fact]
    public void Nested_block_values_use_the_entry_editor_alias_or_look_it_up_by_content_type()
    {
        var block = JObject.Parse($$"""
            { "blocks": {
                "layout": { "Umbraco.BlockList": [ { "contentKey": "c1" } ] },
                "contentData": [ {
                    "contentTypeKey": "{{Inner}}",
                    "key": "c1",
                    "values": [
                        { "alias": "picker", "editorAlias": null, "value": [ { "type": "document", "unique": "2c9d3b9b-8a4e-4f0d-9d3e-3b1b3d3c9a01" } ] },
                        { "alias": "whatever", "editorAlias": "Umbraco.Decimal", "value": 7 },
                        { "alias": "tags", "editorAlias": "Umbraco.Tags", "value": [ "a", "b" ] },
                        { "alias": "text", "value": "kept" }
                    ] } ],
                "settingsData": [], "expose": [] } }
            """);

        var (json, values) = Create().Normalize(block, Outer);

        var entries = json["blocks"]!["contentData"]![0]!["values"]!;
        Assert.Equal("umb://document/2c9d3b9b8a4e4f0d9d3e3b1b3d3c9a01", entries[0]!["value"]!.Value<string>());
        Assert.Equal("7.0", entries[1]!["value"]!.Value<string>());
        Assert.Equal("[\"a\",\"b\"]", entries[2]!["value"]!.Value<string>());
        Assert.Equal("kept", entries[3]!["value"]!.Value<string>());
        Assert.Equal(JTokenType.Object, json["blocks"]!["layout"]!.Type);

        // And the converter-facing value is the whole block value as JSON text.
        var roundTripped = JObject.Parse((string)values["blocks"]!);
        Assert.Equal("c1", roundTripped["contentData"]![0]!["key"]!.Value<string>());
    }

    [Fact]
    public void Block_data_nested_several_levels_deep_is_normalised()
    {
        var stored = TestData.ReadJson("nested-hell-block.json");
        var payload = TestData.EditorPayload(stored, 0);
        var resolver = new BlockValueNormalizer((type, alias) => alias == "dropDown" ? "Umbraco.DropDown.Flexible" : "Umbraco.BlockList");

        var (json, _) = resolver.Normalize(payload, TestData.NestedHellType);

        var innerDropDown = json["nested"]!["contentData"]![0]!["values"]![0]!["value"]!;
        Assert.Equal(JTokenType.String, innerDropDown.Type);
        Assert.Equal("[\"s2\"]", innerDropDown.Value<string>());
    }
}
