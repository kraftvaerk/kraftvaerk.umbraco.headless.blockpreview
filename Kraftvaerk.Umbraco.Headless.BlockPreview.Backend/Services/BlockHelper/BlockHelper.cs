using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NPoco.fastJSON;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PublishedCache;
using Umbraco.Cms.Core.Services;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;
public class BlockHelper : IBlockHelper
{
    private readonly IApiElementBuilder _apiElementBuilder;
    private readonly IContentTypeService _contentTypeService;
    private readonly IPublishedContentTypeFactory _publishedContentTypeFactory;
    public BlockHelper(IApiElementBuilder apiElementBuilder, IContentTypeService contentTypeService, IPublishedContentTypeFactory publishedContentTypeFactory)
    {
        _apiElementBuilder = apiElementBuilder;
        _contentTypeService = contentTypeService;
        _publishedContentTypeFactory = publishedContentTypeFactory;
    }
    public (IApiElement? apiElement, Dictionary<string, object?> rawData) BlockContent(string? content, string? contentTypeGuidString)
    {
        if (content == null || contentTypeGuidString == null || string.IsNullOrEmpty(content) || string.IsNullOrEmpty(contentTypeGuidString)) return Fail();

        var contentAsJObject = JObject.Parse(content);

        var guid = Guid.Parse(contentTypeGuidString);

        var contentType = _contentTypeService.Get(guid);

        //if (contentType == null) return Fail();

        PopulateEditorAlias(contentAsJObject, contentType);

        contentAsJObject = ReNestJson(contentAsJObject);

        content = contentAsJObject.ToString(Formatting.None);


        if (contentType == null) return Fail();

        var publishedContentType = _publishedContentTypeFactory.CreateContentType(contentType);

        Dictionary<string, object>? data = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(content);

        if (data == null)
        {
            return Fail("Failed to deserialize content JSON. Ensure the content is valid JSON.");
        }

        // do further clean up
        CleanupKeys(publishedContentType, data);

        if (data == null) return Fail();

        try
        {
            Dictionary<string, object?> deserializedData = ConvertJsonElement(data);
            VariationContext variationContext = new VariationContext();
            IPublishedElement publishedElement = new PublishedElement(publishedContentType, Guid.NewGuid(), deserializedData, true, variationContext);

            var apiElement = _apiElementBuilder.Build(publishedElement);
            PatchNullPropertiesFromRawData(apiElement, contentAsJObject);
            return (apiElement, deserializedData);
        }
        catch (Exception e)
        {
            return Fail(e.Message);
        }
    }

    private static void CleanupKeys(IPublishedContentType publishedContentType, Dictionary<string, object> data)
    {
        foreach (var key in data.Keys.ToList())
        {
            var prop = publishedContentType.PropertyTypes.FirstOrDefault(x => x.Alias == key);
            if (prop != null && prop.EditorAlias == "Umbraco.MultiNodeTreePicker")
            {
                var originalValue = data[key]?.ToString();
                if (!string.IsNullOrWhiteSpace(originalValue))
                {
                    // Deserialize and ensure the result is not null
                    var deserialized = System.Text.Json.JsonSerializer.Deserialize<List<Dictionary<string, string>>>(originalValue);
                    if (deserialized != null)
                    {
                        var newValue = string.Join(",", deserialized.Select(d =>
                        {
                            // Attempt to get the values, defaulting to an empty string if not found.
                            d.TryGetValue("type", out string? type);
                            d.TryGetValue("unique", out string? unique);
                            return $"umb://{type}/{unique}";
                        }));
                        data[key] = newValue;
                    }
                }
            }
            else if (prop != null && prop.EditorAlias == "Umbraco.Decimal")
            {
                var originalValue = data[key]?.ToString();
                if (!string.IsNullOrWhiteSpace(originalValue) && !originalValue.Contains("."))
                {
                    data[key] = originalValue + ".0";
                }
            }
        }
    }

    private static void PopulateEditorAlias(JObject contentAsJObject, global::Umbraco.Cms.Core.Models.IContentType? contentType)
    {
        if(contentType == null)
            return;
        foreach (var prop in contentAsJObject.Properties().ToList())
        {
            var propType = contentType.PropertyTypes
                .FirstOrDefault(x => x.Alias.Equals(prop.Name, StringComparison.InvariantCulture));

            if (propType == null)
                continue;

            var metaProperty = new JProperty(
                prop.Name + "_editorAlias",
                propType.PropertyEditorAlias
            );

            prop.AddAfterSelf(metaProperty);
        }
    }

    public JObject ReNestJson(JObject node)
    {
        // Start the recursive processing from the root JObject
        var processed = ProcessToken(node);
        return (JObject)processed;
    }

    private JToken ProcessToken(JToken token)
    {
        switch (token.Type)
        {
            case JTokenType.Object:
                return ProcessObject((JObject)token);

            case JTokenType.Array:
                return ProcessArray((JArray)token);

            default:
                // Primitive: just clone it
                return token.DeepClone();
        }
    }

    private JToken ProcessObject(JObject obj)
    {
        var test = obj.ToString();
        // fix nested dropdowns (and anything else that comes up)
        IsArrayToStringFix(obj);

        // fix guids
        if (obj["editorAlias"] != null && obj["editorAlias"]!.Value<string>() == "Umbraco.MultiNodeTreePicker" && obj["value"] != null && obj["value"].ToString().StartsWith("["))
        {
            var value = JArray.Parse(obj["value"]!.ToString());
            var newValueArray = new List<string>();

            foreach(var val in value)
            {
                var type = val["type"].ToString();
                var unique = val["unique"].ToString();
                newValueArray.Add($"umb://{type}/{unique.Replace("-", "")}");
            }
            obj["value"] = string.Join(",", newValueArray);
        }

        var newObj = new JObject();
        foreach (var prop in obj.Properties().ToList())
        {
            if (prop.Name.EndsWith("_editorAlias")) continue;
            newObj[prop.Name] = ProcessToken(prop.Value);
        }

        return newObj;
    }

    private JToken ProcessArray(JArray array)
    {
        var newArray = new JArray();
        foreach (var item in array)
        {
            newArray.Add(ProcessToken(item));
        }
        return newArray;
    }

    public void IsArrayToStringFix(JObject obj)
    {
        var test = obj.ToString();

        // handle inserted _editoralias first
        var props = obj.Properties().ToList();
        var blockProps = props.Where(p => p.Name.Contains("_editorAlias"));

        var hasDirectEditor = props.Any(x => x.Name == "editorAlias");

        if (!blockProps.Any() && !hasDirectEditor)
            return;

        foreach(var blockProp in blockProps)
        {
            var name = blockProp.Name.Replace("_editorAlias", "");
            var original = props.First(x => x.Name == blockProp.Name.Replace("_editorAlias", ""));

            var value = original.Value;

            if(value.Type == JTokenType.Array)
            {
                // mend array to string
                var jsonArrayAsString = value.ToString(Formatting.None);
                original.Value = new JValue(jsonArrayAsString); 
            }
        }

        if(hasDirectEditor)
        {
            var original = props.First(x => x.Name == "value");
            var value = original.Value;

            if (value.Type == JTokenType.Array)
            {
                // mend array to string
                var jsonArrayAsString = value.ToString(Formatting.None);
                original.Value = new JValue(jsonArrayAsString);
            }
        }
    }

    private void FillUdis(JsonNode node)
    {
        if (node is JsonObject obj)
        {
            foreach (var prop in obj)
            {
                if (prop.Key is "udi")
                {
                    if (prop.Value == null || prop.Value is JsonValue val && val.TryGetValue<string>(out var strVal) && string.IsNullOrEmpty(strVal))
                    {
                        obj[prop.Key] = $"umb://element/{Guid.NewGuid()}";
                    }
                }
                else
                {
                    FillUdis(prop.Value!);
                }
            }
        }
        else if (node is JsonArray arr)
        {
            foreach (var item in arr)
            {
                FillUdis(item!);
            }
        }
    }

    /// <summary>
    /// After the API element builder resolves property values, some reference-type
    /// properties (e.g. ContentPicker) may be null because the referenced content
    /// is not in the published cache. This method walks nested block list / block
    /// grid structures and restores those null values from the original raw JSON.
    /// </summary>
    private void PatchNullPropertiesFromRawData(IApiElement apiElement, JObject rawData)
    {
        foreach (var prop in apiElement.Properties.ToList())
        {
            if (prop.Value is ApiBlockListModel blockList)
            {
                var rawObj = GetAsJObject(rawData[prop.Key]);
                if (rawObj != null)
                    PatchBlockItems(blockList.Items, rawObj);
            }
            else if (prop.Value is ApiBlockGridModel blockGrid)
            {
                var rawObj = GetAsJObject(rawData[prop.Key]);
                if (rawObj != null)
                    PatchBlockItems(blockGrid.Items, rawObj);
            }
        }
    }

    private void PatchBlockItems(IEnumerable<ApiBlockItem> items, JObject rawBlockJson)
    {
        var contentData = rawBlockJson["contentData"] as JArray;
        if (contentData == null) return;

        var settingsData = rawBlockJson["settingsData"] as JArray;

        foreach (var item in items)
        {
            PatchElementProperties(item.Content, contentData);

            if (item.Settings != null && settingsData != null)
                PatchElementProperties(item.Settings, settingsData);

            // Handle block grid areas recursively
            if (item is ApiBlockGridItem gridItem)
            {
                foreach (var area in gridItem.Areas)
                    PatchBlockItems(area.Items, rawBlockJson);
            }
        }
    }

    private void PatchElementProperties(IApiElement element, JArray dataArray)
    {
        var matchingData = dataArray.FirstOrDefault(
            cd => string.Equals(
                cd["key"]?.Value<string>(),
                element.Id.ToString(),
                StringComparison.OrdinalIgnoreCase));

        if (matchingData == null) return;

        var values = matchingData["values"] as JArray;
        if (values == null) return;

        // Build alias → raw value mapping
        var rawValues = new JObject();
        foreach (var v in values)
        {
            var alias = v["alias"]?.Value<string>();
            if (alias != null)
                rawValues[alias] = v["value"]?.DeepClone() ?? JValue.CreateNull();
        }

        // Replace null properties with their raw values
        foreach (var kvp in element.Properties.ToList())
        {
            if (kvp.Value == null
                && rawValues[kvp.Key] != null
                && rawValues[kvp.Key]!.Type != JTokenType.Null)
            {
                element.Properties[kvp.Key] = ConvertJTokenToClrValue(rawValues[kvp.Key]!);
            }
        }

        // Recurse into any nested block lists / grids inside this element
        PatchNullPropertiesFromRawData(element, rawValues);
    }

    private static JObject? GetAsJObject(JToken? token)
    {
        if (token == null) return null;
        if (token.Type == JTokenType.Object) return (JObject)token;
        if (token.Type == JTokenType.String)
        {
            var str = token.Value<string>();
            if (!string.IsNullOrWhiteSpace(str))
            {
                try { return JObject.Parse(str); }
                catch { return null; }
            }
        }
        return null;
    }

    private static object? ConvertJTokenToClrValue(JToken token)
    {
        return token.Type switch
        {
            JTokenType.String => token.Value<string>(),
            JTokenType.Integer => token.Value<long>(),
            JTokenType.Float => token.Value<double>(),
            JTokenType.Boolean => token.Value<bool>(),
            JTokenType.Null => null,
            _ => token.ToString(Formatting.None),
        };
    }

    private (IApiElement? apiElement, Dictionary<string, object?> rawData) Fail(string reason = "")
    {
        return (null, new Dictionary<string, object?>());
    }

    private Dictionary<string, object?> ConvertJsonElement(Dictionary<string, object> dictionary)
    {
        var result = new Dictionary<string, object?>();

        foreach (var kvp in dictionary)
        {
            if (kvp.Value is JsonElement element)
            {
                result[kvp.Key] = ConvertJsonValue(element);
            }
            else if (kvp.Value is Dictionary<string, object?> nestedDict)
            {
                result[kvp.Key] = ConvertJsonElement(nestedDict!);
            }
            else
            {
                result[kvp.Key] = kvp.Value;
            }
        }

        return result;
    }

    private object? ConvertJsonValue(JsonElement element)
    {
        return element.ValueKind switch
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
    }
}

