using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Umbraco.Cms.Core.Models.DeliveryApi;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;

/// <summary>
/// The Delivery API element builder resolves nested block items through the published cache, which knows nothing
/// about an element that only exists in the editor. Their properties therefore come back null. This fills them in
/// from the raw block data the editor sent.
/// </summary>
public static class ApiElementPatcher
{
    public static void PatchNullProperties(IApiElement apiElement, JObject rawData)
    {
        foreach (var (alias, value) in apiElement.Properties.ToList())
        {
            switch (value)
            {
                case ApiBlockListModel blockList when AsObject(rawData[alias]) is { } raw:
                    PatchItems(blockList.Items, raw);
                    break;
                case ApiBlockGridModel blockGrid when AsObject(rawData[alias]) is { } raw:
                    PatchItems(blockGrid.Items, raw);
                    break;
            }
        }
    }

    private static void PatchItems(IEnumerable<ApiBlockItem> items, JObject rawBlockValue)
    {
        if (rawBlockValue["contentData"] is not JArray contentData)
            return;

        var settingsData = rawBlockValue["settingsData"] as JArray;

        foreach (var item in items)
        {
            PatchElement(item.Content, contentData);

            if (item.Settings != null && settingsData != null)
                PatchElement(item.Settings, settingsData);

            if (item is ApiBlockGridItem gridItem)
            {
                foreach (var area in gridItem.Areas)
                    PatchItems(area.Items, rawBlockValue);
            }
        }
    }

    private static void PatchElement(IApiElement element, JArray entries)
    {
        var entry = entries.FirstOrDefault(e =>
            string.Equals(e["key"]?.Value<string>(), element.Id.ToString(), StringComparison.OrdinalIgnoreCase));

        if (entry?["values"] is not JArray values)
            return;

        var rawValues = new JObject();
        foreach (var v in values)
        {
            var alias = v["alias"]?.Value<string>();
            if (alias != null)
                rawValues[alias] = v["value"]?.DeepClone() ?? JValue.CreateNull();
        }

        foreach (var (alias, value) in element.Properties.ToList())
        {
            if (value == null && rawValues[alias] is { Type: not JTokenType.Null } raw)
                element.Properties[alias] = ToClrValue(raw);
        }

        // The nested element may itself contain block editors.
        PatchNullProperties(element, rawValues);
    }

    private static JObject? AsObject(JToken? token) => token switch
    {
        JObject obj => obj,
        JValue { Type: JTokenType.String } str when !string.IsNullOrWhiteSpace(str.Value<string>()) => TryParse(str.Value<string>()!),
        _ => null,
    };

    private static JObject? TryParse(string json)
    {
        try { return JObject.Parse(json); } catch (JsonException) { return null; }
    }

    private static object? ToClrValue(JToken token) => token.Type switch
    {
        JTokenType.String => token.Value<string>(),
        JTokenType.Integer => token.Value<long>(),
        JTokenType.Float => token.Value<double>(),
        JTokenType.Boolean => token.Value<bool>(),
        JTokenType.Null => null,
        _ => token.ToString(Formatting.None),
    };
}
