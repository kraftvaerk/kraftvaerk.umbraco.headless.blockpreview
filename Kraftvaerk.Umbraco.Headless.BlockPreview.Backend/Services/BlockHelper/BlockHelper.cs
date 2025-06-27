using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
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
    public IApiElement? BlockContent(string? content, string? contentTypeGuidString)
    {
        if(content == null || contentTypeGuidString == null || string.IsNullOrEmpty(content) || string.IsNullOrEmpty(contentTypeGuidString)) return Fail();

        var guid = Guid.Parse(contentTypeGuidString);

        var contentType = _contentTypeService.Get(guid);

        if(contentType == null) return Fail();

        var publishedContentType = _publishedContentTypeFactory.CreateContentType(contentType);

        //content = PopulateMissingUdis(content);


        Dictionary<string, object>? data = JsonSerializer.Deserialize<Dictionary<string, object>>(content);

        if(data == null)
        {
            return Fail("Failed to deserialize content JSON. Ensure the content is valid JSON.");
        }
        // do further clean up
        foreach (var key in data.Keys.ToList())
        {
            var prop = publishedContentType.PropertyTypes.FirstOrDefault(x => x.Alias == key);
            if (prop != null && prop.EditorAlias == "Umbraco.MultiNodeTreePicker")
            {
                var originalValue = data[key]?.ToString();
                if (!string.IsNullOrWhiteSpace(originalValue))
                {
                    // Deserialize and ensure the result is not null
                    var deserialized = JsonSerializer.Deserialize<List<Dictionary<string, string>>>(originalValue);
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

        if (data == null) return Fail();
        Dictionary<string, object?> deserializedData = ConvertJsonElement(data);
        


        VariationContext variationContext = new VariationContext();
        IPublishedElement publishedElement = new PublishedElement(publishedContentType, Guid.NewGuid(), deserializedData, true, variationContext);

        var apiElement = _apiElementBuilder.Build(publishedElement);

        return apiElement;
    }

    private string PopulateMissingUdis(string json)
    {
        var node = JsonNode.Parse(json);
        if (node == null) throw new InvalidOperationException("Invalid JSON");

        FillUdis(node);
        return node.ToJsonString(new JsonSerializerOptions { WriteIndented = true });
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

    private IApiElement? Fail(string reason = "")
    {
        return null;
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

