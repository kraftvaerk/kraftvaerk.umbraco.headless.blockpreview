using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Exceptions;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Tests.Support;
using Newtonsoft.Json.Linq;
using Xunit;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Tests;

/// <summary>
/// The backoffice posts block data in editor shape; BlockHelper has to turn it into the source values
/// Umbraco's value converters expect. These tests pin that translation down using blocks captured from the sample site.
/// </summary>
public class BlockHelperTests
{
    private static readonly Guid Key = Guid.Parse("11111111-2222-3333-4444-555555555555");

    [Fact]
    public void Demo_block_keeps_scalars_and_serialises_complex_values()
    {
        var helper = UmbracoFakes.SampleSite().CreateBlockHelper();
        var payload = TestData.DemoBlockEditorPayload();

        var result = helper.BuildElement(payload.ToString(), TestData.TestBlockType.ToString(), Key)!;

        Assert.Equal(Key, result.Element.Key);
        Assert.Equal("testBlock", result.Element.ContentType.Alias);
        Assert.Equal(28, result.Element.Properties.Count());

        Assert.Equal("æøå", result.RawData["textbox"]);
        Assert.Equal("kaspar.kjeldsen@kraftvaerk.com", result.RawData["email"]);
        Assert.Equal("#ff0000", result.RawData["eyeDropPicker"]);

        // Arrays and objects reach the converters as JSON strings, the way Umbraco stores them.
        Assert.Equal("[\"TAG1\",\"tag 2\"]", result.RawData["tags"]);
        Assert.Equal("[\"s1\"]", result.RawData["dropdown"]);
        Assert.Equal("[\"1\",\"3\"]", result.RawData["checkboxlist"]);
        var color = JObject.Parse((string)result.RawData["colorPicker"]!);
        Assert.Equal("#00b3ff", color["value"]!.Value<string>());

        // Nested block editors survive as valid block value JSON.
        var grid = JObject.Parse((string)result.RawData["blockGrid"]!);
        Assert.NotEmpty((JArray)grid["contentData"]!);
        var list = JObject.Parse((string)result.RawData["blocklist"]!);
        Assert.NotEmpty((JArray)list["contentData"]!);
    }

    [Fact]
    public void Decimal_values_always_carry_a_fraction()
    {
        var helper = UmbracoFakes.SampleSite().CreateBlockHelper();
        var payload = TestData.DemoBlockEditorPayload();
        payload["decimal"] = "1";

        var result = helper.BuildElement(payload.ToString(), TestData.TestBlockType.ToString())!;

        Assert.Equal("1.0", result.RawData["decimal"]);
    }

    [Fact]
    public void Editor_shaped_multi_node_tree_picker_becomes_udi_csv()
    {
        var helper = UmbracoFakes.SampleSite().CreateBlockHelper();
        var payload = TestData.DemoBlockEditorPayload();
        var first = Guid.Parse("df0c2388-df3c-4126-bc32-640f87a66292");
        var second = Guid.Parse("35a65b13-4b94-4830-a6ca-53bc9f321544");
        payload["contentPicker"] = new JArray(
            new JObject { ["type"] = "document", ["unique"] = first.ToString() },
            new JObject { ["type"] = "document", ["unique"] = second.ToString() });

        var result = helper.BuildElement(payload.ToString(), TestData.TestBlockType.ToString())!;

        var udis = ((string)result.RawData["contentPicker"]!).Split(',');
        Assert.Equal(2, udis.Length);
        Assert.Equal(first, UdiGuid(udis[0], "document"));
        Assert.Equal(second, UdiGuid(udis[1], "document"));
    }

    [Fact]
    public void Stored_multi_node_tree_picker_csv_is_left_alone()
    {
        var helper = UmbracoFakes.SampleSite().CreateBlockHelper();
        var payload = TestData.DemoBlockEditorPayload();

        var result = helper.BuildElement(payload.ToString(), TestData.TestBlockType.ToString())!;

        Assert.Equal("umb://document/df0c2388df3c4126bc32640f87a66292", result.RawData["contentPicker"]);
    }

    [Fact]
    public void Multi_node_tree_picker_inside_a_nested_block_is_converted_too()
    {
        var helper = UmbracoFakes.SampleSite().CreateBlockHelper();
        var payload = TestData.DemoBlockEditorPayload();
        var picked = Guid.Parse("df0c2388-df3c-4126-bc32-640f87a66292");

        // Put an editor-shaped MNTP value on the first block inside the block list property.
        var list = (JObject)payload["blocklist"]!;
        var values = (JArray)list["contentData"]![0]!["values"]!;
        values.Add(new JObject
        {
            ["alias"] = "contentPicker",
            ["editorAlias"] = "Umbraco.MultiNodeTreePicker",
            ["culture"] = null,
            ["segment"] = null,
            ["value"] = new JArray(new JObject { ["type"] = "document", ["unique"] = picked.ToString() }),
        });

        var result = helper.BuildElement(payload.ToString(), TestData.TestBlockType.ToString())!;

        var nested = JObject.Parse((string)result.RawData["blocklist"]!);
        var nestedPicker = nested["contentData"]![0]!["values"]!
            .First(v => v["alias"]!.Value<string>() == "contentPicker")["value"]!;
        Assert.Equal(JTokenType.String, nestedPicker.Type);
        Assert.Equal(picked, UdiGuid(nestedPicker.Value<string>()!, "document"));
    }

    [Fact]
    public void Editor_alias_markers_never_leak_into_the_result()
    {
        var helper = UmbracoFakes.SampleSite().CreateBlockHelper();
        var payload = TestData.DemoBlockEditorPayload();

        var result = helper.BuildElement(payload.ToString(), TestData.TestBlockType.ToString())!;

        Assert.DoesNotContain(result.RawData.Keys, k => k.EndsWith("_editorAlias"));
        Assert.DoesNotContain("_editorAlias", result.RawJson.ToString());
        Assert.DoesNotContain(result.RawData.Values.OfType<string>(), v => v.Contains("_editorAlias"));
    }

    [Fact]
    public void Json_scalars_become_clr_values()
    {
        var helper = UmbracoFakes.SampleSite().CreateBlockHelper();
        var payload = new JObject
        {
            ["numeric"] = 2,
            ["toggle"] = true,
            ["slider"] = 3.5,
            ["textbox"] = null,
        };

        var result = helper.BuildElement(payload.ToString(), TestData.TestBlockType.ToString())!;

        Assert.Equal(2L, result.RawData["numeric"]);
        Assert.Equal(true, result.RawData["toggle"]);
        Assert.Equal(3.5, result.RawData["slider"]);
        Assert.Null(result.RawData["textbox"]);
    }

    [Fact]
    public void Nested_hell_keeps_its_nested_block_list_intact()
    {
        var helper = UmbracoFakes.SampleSite().CreateBlockHelper();
        var stored = TestData.ReadJson("nested-hell-block.json");
        var payload = TestData.EditorPayload(stored, 0);

        var result = helper.BuildElement(payload.ToString(), TestData.NestedHellType.ToString(), TestData.ContentKey(stored, 0))!;

        Assert.Equal("[\"s1\"]", result.RawData["dropDown"]);
        var nested = JObject.Parse((string)result.RawData["nested"]!);
        Assert.Equal("a66f3ff5-ecd0-4503-aabc-fe4f48ad8f61", nested["contentData"]![0]!["key"]!.Value<string>());
        Assert.NotNull(nested["expose"]);

        // Array values inside nested blocks are serialised the same way as top-level ones.
        var innerValues = nested["contentData"]![0]!["values"]!;
        Assert.Equal("dropDown", innerValues[0]!["alias"]!.Value<string>());
        Assert.Equal("[\"s2\"]", innerValues[0]!["value"]!.Value<string>());
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Missing_content_or_type_yields_null(string? missing)
    {
        var helper = UmbracoFakes.SampleSite().CreateBlockHelper();

        Assert.Null(helper.BuildElement(missing, TestData.TestBlockType.ToString()));
        Assert.Null(helper.BuildElement("{}", missing));
    }

    [Fact]
    public void Invalid_content_type_key_is_a_400()
    {
        var helper = UmbracoFakes.SampleSite().CreateBlockHelper();

        var ex = Assert.Throws<BlockPreviewException>(() => helper.BuildElement("{}", "not-a-guid"));
        Assert.Equal(400, ex.StatusCode);
        Assert.Contains("not-a-guid", ex.Message);
    }

    [Fact]
    public void Unknown_content_type_is_a_400()
    {
        var helper = UmbracoFakes.SampleSite().CreateBlockHelper();
        var unknown = Guid.NewGuid();

        var ex = Assert.Throws<BlockPreviewException>(() => helper.BuildElement("{}", unknown.ToString()));
        Assert.Equal(400, ex.StatusCode);
        Assert.Contains(unknown.ToString(), ex.Message);
    }

    [Fact]
    public void Malformed_json_is_a_400_naming_the_block()
    {
        var helper = UmbracoFakes.SampleSite().CreateBlockHelper();

        var ex = Assert.Throws<BlockPreviewException>(() => helper.BuildElement("{not json", TestData.TestBlockType.ToString()));
        Assert.Equal(400, ex.StatusCode);
        Assert.Contains("testBlock", ex.Message);
    }

    [Fact]
    public void BlockContent_wraps_element_and_api_element()
    {
        var fakes = UmbracoFakes.SampleSite();
        var helper = fakes.CreateBlockHelper();

        var (apiElement, raw) = helper.BlockContent(TestData.DemoBlockEditorPayload().ToString(), TestData.TestBlockType.ToString());

        Assert.NotNull(apiElement);
        Assert.Equal("testBlock", apiElement!.ContentType);
        Assert.Equal(fakes.LastBuiltElement!.Key, apiElement.Id);
        Assert.Equal("æøå", raw["textbox"]);
        Assert.Equal((null, 0), (helper.BlockContent(null, null).apiElement, helper.BlockContent(null, null).rawData.Count));
    }

    private static Guid UdiGuid(string udi, string entityType)
    {
        var prefix = $"umb://{entityType}/";
        Assert.StartsWith(prefix, udi);
        return Guid.Parse(udi[prefix.Length..]);
    }
}
