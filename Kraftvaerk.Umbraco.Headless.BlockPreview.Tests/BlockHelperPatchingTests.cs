using Kraftvaerk.Umbraco.Headless.BlockPreview.Tests.Support;
using Moq;
using Newtonsoft.Json.Linq;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;
using Xunit;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Tests;

/// <summary>
/// The Delivery API builder cannot resolve nested block values from an unsaved element, so it leaves them null.
/// BlockHelper fills those holes from the raw JSON the editor sent.
/// </summary>
public class BlockHelperPatchingTests
{
    [Fact]
    public void Null_properties_on_nested_block_list_items_are_filled_from_raw_json()
    {
        var fakes = UmbracoFakes.SampleSite();
        var stored = TestData.ReadJson("nested-hell-block.json");
        var innerKey = Guid.Parse("a66f3ff5-ecd0-4503-aabc-fe4f48ad8f61"); // the nestedHell inside "nested"

        fakes.ApiElementBuilder.Setup(x => x.Build(It.IsAny<IPublishedElement>()))
            .Returns((IPublishedElement e) => new ApiElement(e.Key, "nestedHell", new Dictionary<string, object?>
            {
                ["dropDown"] = "kept",
                ["nested"] = new ApiBlockListModel(
                [
                    new ApiBlockItem(new ApiElement(innerKey, "nestedHell", new Dictionary<string, object?>
                    {
                        ["dropDown"] = null,
                        ["nested"] = null,
                    }), null),
                ]),
            }));

        var helper = fakes.CreateBlockHelper();
        var element = helper.BuildElement(TestData.EditorPayload(stored, 0).ToString(), TestData.NestedHellType.ToString())!;

        var api = helper.BuildApiElement(element);

        Assert.Equal("kept", api.Properties["dropDown"]);
        var inner = ((ApiBlockListModel)api.Properties["nested"]!).Items.Single().Content;
        Assert.Equal("[\"s2\"]", inner.Properties["dropDown"]);
        Assert.Null(inner.Properties["nested"]); // the raw data had no "nested" value for the inner block
    }

    [Fact]
    public void Items_without_matching_raw_data_are_untouched()
    {
        var fakes = UmbracoFakes.SampleSite();
        var stored = TestData.ReadJson("nested-hell-block.json");

        fakes.ApiElementBuilder.Setup(x => x.Build(It.IsAny<IPublishedElement>()))
            .Returns((IPublishedElement e) => new ApiElement(e.Key, "nestedHell", new Dictionary<string, object?>
            {
                ["nested"] = new ApiBlockListModel(
                [
                    new ApiBlockItem(new ApiElement(Guid.NewGuid(), "nestedHell", new Dictionary<string, object?> { ["dropDown"] = null }), null),
                ]),
            }));

        var helper = fakes.CreateBlockHelper();
        var element = helper.BuildElement(TestData.EditorPayload(stored, 0).ToString(), TestData.NestedHellType.ToString())!;

        var api = helper.BuildApiElement(element);

        Assert.Null(((ApiBlockListModel)api.Properties["nested"]!).Items.Single().Content.Properties["dropDown"]);
    }

    [Fact]
    public void Grid_areas_are_patched_recursively()
    {
        var fakes = UmbracoFakes.SampleSite();
        var stored = TestData.ReadJson("test-grid.json");
        var payload = TestData.EditorPayload(stored, 0);
        var grid = (JObject)payload["blockGrid"]!;
        var gridItemKey = Guid.Parse(grid["contentData"]![0]!["key"]!.Value<string>()!);
        var gridItemAlias = grid["contentData"]![0]!["values"]![0]!["alias"]!.Value<string>()!;

        fakes.ApiElementBuilder.Setup(x => x.Build(It.IsAny<IPublishedElement>()))
            .Returns((IPublishedElement e) => new ApiElement(e.Key, "testBlock", new Dictionary<string, object?>
            {
                ["blockGrid"] = new ApiBlockGridModel(12,
                [
                    new ApiBlockGridItem(new ApiElement(Guid.NewGuid(), "rteBlock", new Dictionary<string, object?>()), null, 1, 12, 12,
                    [
                        new ApiBlockGridArea("inner", 12, 1,
                        [
                            new ApiBlockGridItem(new ApiElement(gridItemKey, "rteBlock", new Dictionary<string, object?> { [gridItemAlias] = null }), null, 1, 12, 12, []),
                        ]),
                    ]),
                ]),
            }));

        var helper = fakes.CreateBlockHelper();
        var element = helper.BuildElement(payload.ToString(), TestData.TestBlockType.ToString())!;

        var api = helper.BuildApiElement(element);

        var areaItem = ((ApiBlockGridModel)api.Properties["blockGrid"]!).Items.Single().Areas.Single().Items.Single();
        Assert.NotNull(areaItem.Content.Properties[gridItemAlias]);
    }
}
