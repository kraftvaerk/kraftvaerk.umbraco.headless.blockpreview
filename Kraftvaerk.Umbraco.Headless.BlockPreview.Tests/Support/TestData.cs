using Newtonsoft.Json.Linq;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Tests.Support;

/// <summary>
/// Block values captured from the sample site (Umbraco/17.4.2/uSync/v17/Content) as Umbraco stores them.
/// The backoffice sends a block to the preview endpoint as a flat { alias: value } object, so
/// <see cref="EditorPayload"/> turns a stored contentData entry into exactly that shape.
/// </summary>
public static class TestData
{
    public static readonly Guid TestBlockType = Guid.Parse("fb1c626d-b539-49be-9295-412f1bfe462a");
    public static readonly Guid NestedHellType = Guid.Parse("28fd7acc-0f3a-4228-bcdc-bdc86e2ee7a5");
    public static readonly Guid RteBlockType = Guid.Parse("387fbbea-8c41-4019-ac76-c3e6e590f6e1");

    public static string Read(string name) =>
        File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "TestData", name));

    public static JObject ReadJson(string name) => JObject.Parse(Read(name));

    /// <summary>
    /// The "demo" test block (every property editor) as it sits inside the page's block grid.
    /// </summary>
    public static JObject DemoBlockEditorPayload() => EditorPayload(ReadJson("test-grid.json"), 0);

    /// <summary>
    /// The nestedHell block: a dropdown plus a block list containing another nestedHell.
    /// </summary>
    public static JObject NestedHellEditorPayload() => EditorPayload(ReadJson("nested-hell-block.json"), 0);

    /// <summary>
    /// Flattens contentData[index].values into { alias: value }, the shape the backoffice posts.
    /// </summary>
    public static JObject EditorPayload(JObject storedBlockValue, int index)
    {
        var entry = (JObject)storedBlockValue["contentData"]![index]!;
        var flat = new JObject();
        foreach (var value in (JArray)entry["values"]!)
            flat[value["alias"]!.Value<string>()!] = value["value"]?.DeepClone() ?? JValue.CreateNull();
        return flat;
    }

    public static Guid ContentKey(JObject storedBlockValue, int index) =>
        Guid.Parse(storedBlockValue["contentData"]![index]!["key"]!.Value<string>()!);
}
