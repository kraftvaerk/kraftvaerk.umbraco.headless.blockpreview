using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text.Json;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewSettings;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;

public class BlockHelper : IBlockHelper
{
    private readonly IApiElementBuilder _apiElementBuilder;
    private readonly IContentTypeService _contentTypeService;
    private readonly IPublishedContentTypeFactory _publishedContentTypeFactory;
    private readonly IBlockPreviewSettings _settings;
    private readonly ILogger<BlockHelper> _logger;

    public BlockHelper(
        IApiElementBuilder apiElementBuilder,
        IContentTypeService contentTypeService,
        IPublishedContentTypeFactory publishedContentTypeFactory,
        IBlockPreviewSettings settings,
        ILogger<BlockHelper> logger)
    {
        _apiElementBuilder = apiElementBuilder;
        _contentTypeService = contentTypeService;
        _publishedContentTypeFactory = publishedContentTypeFactory;
        _settings = settings;
        _logger = logger;
    }

    public (IApiElement? apiElement, Dictionary<string, object?> rawData) BlockContent(string? content, string? contentTypeGuidString)
    {
        if (string.IsNullOrEmpty(content) || string.IsNullOrEmpty(contentTypeGuidString)) return Fail();

        var debug = _settings.Options(null, null, null).Debug;
        var contentAsJObject = JObject.Parse(content);
        var guid = Guid.Parse(contentTypeGuidString);
        var contentType = _contentTypeService.Get(guid);

        PopulateEditorAlias(contentAsJObject, contentType);
        contentAsJObject = ReNestJson(contentAsJObject);
        content = contentAsJObject.ToString(Formatting.None);

        if (contentType == null)
        {
            if (debug) _logger.LogWarning("BlockPreview Debug: Content type {Guid} not found in Umbraco.", guid);
            return Fail();
        }

        var publishedContentType = _publishedContentTypeFactory.CreateContentType(contentType);

        var data = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(content);
        if (data == null)
        {
            if (debug) _logger.LogWarning("BlockPreview Debug: Failed to deserialize content JSON for content type {Guid}.", guid);
            return Fail();
        }

        CleanupKeys(publishedContentType, data);

        try
        {
            var deserializedData = ConvertJsonElement(data);
            var publishedElement = new PreviewPublishedElement(publishedContentType, Guid.NewGuid(), deserializedData);
            var apiElement = _apiElementBuilder.Build(publishedElement);
            PatchNullPropertiesFromRawData(apiElement, contentAsJObject);
            return (apiElement, deserializedData);
        }
        catch (Exception e)
        {
            if (debug) _logger.LogWarning(e, "BlockPreview Debug: Exception building IApiElement for content type {Guid}.", guid);
            return Fail();
        }
    }

    private static void PopulateEditorAlias(JObject contentAsJObject, global::Umbraco.Cms.Core.Models.IContentType? contentType)
    {
        if (contentType == null) return;

        foreach (var prop in contentAsJObject.Properties().ToList())
        {
            var propType = contentType.PropertyTypes
                .FirstOrDefault(x => x.Alias.Equals(prop.Name, StringComparison.InvariantCulture));

            if (propType != null)
                prop.AddAfterSelf(new JProperty(prop.Name + "_editorAlias", propType.PropertyEditorAlias));
        }
    }

    private static void CleanupKeys(IPublishedContentType publishedContentType, Dictionary<string, object> data)
    {
        foreach (var key in data.Keys.ToList())
        {
            var prop = publishedContentType.PropertyTypes.FirstOrDefault(x => x.Alias == key);

            if (prop?.EditorAlias == "Umbraco.MultiNodeTreePicker")
            {
                var originalValue = data[key]?.ToString();
                if (!string.IsNullOrWhiteSpace(originalValue))
                {
                    var deserialized = System.Text.Json.JsonSerializer.Deserialize<List<Dictionary<string, string>>>(originalValue);
                    if (deserialized != null)
                    {
                        data[key] = string.Join(",", deserialized.Select(d =>
                        {
                            d.TryGetValue("type", out string? type);
                            d.TryGetValue("unique", out string? unique);
                            return $"umb://{type}/{unique}";
                        }));
                    }
                }
            }
            else if (prop?.EditorAlias == "Umbraco.Decimal")
            {
                var originalValue = data[key]?.ToString();
                if (!string.IsNullOrWhiteSpace(originalValue) && !originalValue.Contains('.'))
                    data[key] = originalValue + ".0";
            }
        }
    }

    private JObject ReNestJson(JObject node) => (JObject)ProcessToken(node);

    private JToken ProcessToken(JToken token) => token.Type switch
    {
        JTokenType.Object => ProcessObject((JObject)token),
        JTokenType.Array => ProcessArray((JArray)token),
        _ => token.DeepClone(),
    };

    private JToken ProcessObject(JObject obj)
    {
        // Some editors send their value as an array when it should be a serialized JSON string
        FixArrayValues(obj);

        // MNTP sends guids as typed objects; normalize to umb:// URIs
        if (obj["editorAlias"]?.Value<string>() == "Umbraco.MultiNodeTreePicker"
            && obj["value"]?.ToString().StartsWith('[') == true)
        {
            var value = JArray.Parse(obj["value"]!.ToString());
            obj["value"] = string.Join(",", value.Select(val =>
                $"umb://{val["type"]}/{val["unique"]!.ToString().Replace("-", "")}"));
        }

        var newObj = new JObject();
        foreach (var prop in obj.Properties().Where(p => !p.Name.EndsWith("_editorAlias")))
            newObj[prop.Name] = ProcessToken(prop.Value);

        return newObj;
    }

    private JToken ProcessArray(JArray array)
    {
        var newArray = new JArray();
        foreach (var item in array)
            newArray.Add(ProcessToken(item));
        return newArray;
    }

    // Some property editors expect their value as a serialized JSON string rather than a parsed array.
    // When the backoffice sends the value as an array token, re-serialize it to a string.
    private static void FixArrayValues(JObject obj)
    {
        var props = obj.Properties().ToList();

        foreach (var aliasProp in props.Where(p => p.Name.EndsWith("_editorAlias")))
        {
            var valueProp = props.FirstOrDefault(x => x.Name == aliasProp.Name.Replace("_editorAlias", ""));
            if (valueProp?.Value.Type == JTokenType.Array)
                valueProp.Value = new JValue(valueProp.Value.ToString(Formatting.None));
        }

        if (props.Any(x => x.Name == "editorAlias"))
        {
            var valueProp = props.FirstOrDefault(x => x.Name == "value");
            if (valueProp?.Value.Type == JTokenType.Array)
                valueProp.Value = new JValue(valueProp.Value.ToString(Formatting.None));
        }
    }

    private static void PatchNullPropertiesFromRawData(IApiElement apiElement, JObject rawData)
    {
        foreach (var prop in apiElement.Properties.ToList())
        {
            if (prop.Value is ApiBlockListModel blockList)
            {
                var rawObj = GetAsJObject(rawData[prop.Key]);
                if (rawObj != null) PatchBlockItems(blockList.Items, rawObj);
            }
            else if (prop.Value is ApiBlockGridModel blockGrid)
            {
                var rawObj = GetAsJObject(rawData[prop.Key]);
                if (rawObj != null) PatchBlockItems(blockGrid.Items, rawObj);
            }
        }
    }

    private static void PatchBlockItems(IEnumerable<ApiBlockItem> items, JObject rawBlockJson)
    {
        var contentData = rawBlockJson["contentData"] as JArray;
        if (contentData == null) return;

        var settingsData = rawBlockJson["settingsData"] as JArray;

        foreach (var item in items)
        {
            PatchElementProperties(item.Content, contentData);

            if (item.Settings != null && settingsData != null)
                PatchElementProperties(item.Settings, settingsData);

            if (item is ApiBlockGridItem gridItem)
            {
                foreach (var area in gridItem.Areas)
                    PatchBlockItems(area.Items, rawBlockJson);
            }
        }
    }

    private static void PatchElementProperties(IApiElement element, JArray dataArray)
    {
        var matchingData = dataArray.FirstOrDefault(
            cd => string.Equals(cd["key"]?.Value<string>(), element.Id.ToString(), StringComparison.OrdinalIgnoreCase));

        if (matchingData == null) return;

        if (matchingData["values"] is not JArray values) return;

        var rawValues = new JObject();
        foreach (var v in values)
        {
            var alias = v["alias"]?.Value<string>();
            if (alias != null)
                rawValues[alias] = v["value"]?.DeepClone() ?? JValue.CreateNull();
        }

        foreach (var kvp in element.Properties.ToList())
        {
            if (kvp.Value == null && rawValues[kvp.Key]?.Type is not (null or JTokenType.Null))
                element.Properties[kvp.Key] = ConvertJTokenToClrValue(rawValues[kvp.Key]!);
        }

        PatchNullPropertiesFromRawData(element, rawValues);
    }

    private static JObject? GetAsJObject(JToken? token)
    {
        if (token?.Type == JTokenType.Object) return (JObject)token;
        if (token?.Type == JTokenType.String)
        {
            var str = token.Value<string>();
            if (!string.IsNullOrWhiteSpace(str))
                try { return JObject.Parse(str); } catch { return null; }
        }
        return null;
    }

    private static object? ConvertJTokenToClrValue(JToken token) => token.Type switch
    {
        JTokenType.String => token.Value<string>(),
        JTokenType.Integer => token.Value<long>(),
        JTokenType.Float => token.Value<double>(),
        JTokenType.Boolean => token.Value<bool>(),
        JTokenType.Null => null,
        _ => token.ToString(Formatting.None),
    };

    private static Dictionary<string, object?> ConvertJsonElement(Dictionary<string, object> dictionary)
    {
        var result = new Dictionary<string, object?>();
        foreach (var kvp in dictionary)
        {
            if (kvp.Value is JsonElement element)
                result[kvp.Key] = ConvertJsonValue(element);
            else if (kvp.Value is Dictionary<string, object?> nestedDict)
                result[kvp.Key] = ConvertJsonElement(nestedDict!);
            else
                result[kvp.Key] = kvp.Value;
        }
        return result;
    }

    private static object? ConvertJsonValue(JsonElement element) => element.ValueKind switch
    {
        JsonValueKind.Object => element.GetRawText(),
        JsonValueKind.Array => element.GetRawText(),
        JsonValueKind.String => element.GetString(),
        JsonValueKind.Number => element.TryGetInt64(out long l) ? l : (object)element.GetDouble(),
        JsonValueKind.True => true,
        JsonValueKind.False => false,
        JsonValueKind.Null => null,
        _ => element.GetRawText(),
    };

    private static (IApiElement? apiElement, Dictionary<string, object?> rawData) Fail() =>
        (null, []);
}
