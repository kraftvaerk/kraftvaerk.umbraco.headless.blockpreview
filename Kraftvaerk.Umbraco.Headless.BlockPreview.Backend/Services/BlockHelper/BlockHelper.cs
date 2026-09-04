using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Exceptions;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Umbraco.Cms.Core.DeliveryApi;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;

public class BlockHelper : IBlockHelper
{
    private readonly IApiElementBuilder _apiElementBuilder;
    private readonly IContentTypeService _contentTypeService;
    private readonly IPublishedContentTypeFactory _publishedContentTypeFactory;
    private readonly ILogger<BlockHelper> _logger;

    // Content types are looked up per property of every nested block; keep them for the lifetime of this (transient) helper.
    private readonly Dictionary<Guid, IContentType?> _contentTypes = new();

    public BlockHelper(
        IApiElementBuilder apiElementBuilder,
        IContentTypeService contentTypeService,
        IPublishedContentTypeFactory publishedContentTypeFactory,
        ILogger<BlockHelper> logger)
    {
        _apiElementBuilder = apiElementBuilder;
        _contentTypeService = contentTypeService;
        _publishedContentTypeFactory = publishedContentTypeFactory;
        _logger = logger;
    }

    public (IApiElement? apiElement, Dictionary<string, object?> rawData) BlockContent(string? content, string? contentTypeGuidString)
    {
        var element = BuildElement(content, contentTypeGuidString);
        return element == null ? (null, []) : (BuildApiElement(element), element.RawData);
    }

    public BlockElement? BuildElement(string? content, string? contentTypeGuidString, Guid? elementKey = null)
    {
        if (string.IsNullOrWhiteSpace(content) || string.IsNullOrWhiteSpace(contentTypeGuidString))
            return null;

        if (!Guid.TryParse(contentTypeGuidString, out var contentTypeKey))
            throw new BlockPreviewException($"'{contentTypeGuidString}' is not a valid content type key.", 400);

        var contentType = GetContentType(contentTypeKey)
            ?? throw new BlockPreviewException($"Content type {contentTypeKey} was not found.", 400);

        JObject block;
        try
        {
            block = JObject.Parse(content);
        }
        catch (JsonException e)
        {
            throw new BlockPreviewException($"Block data for '{contentType.Alias}' is not valid JSON: {e.Message}", 400, e);
        }

        var (json, sourceValues) = new BlockValueNormalizer(EditorAliasFor).Normalize(block, contentTypeKey);

        try
        {
            var publishedContentType = _publishedContentTypeFactory.CreateContentType(contentType);
            var element = PublishedElementProxy.Create(publishedContentType, elementKey ?? Guid.NewGuid(), sourceValues);
            return new BlockElement { Element = element, RawData = sourceValues, RawJson = json };
        }
        catch (Exception e)
        {
            throw new BlockPreviewException($"Could not create an element of type '{contentType.Alias}': {e.Message}", 500, e);
        }
    }

    public IApiElement BuildApiElement(BlockElement element)
    {
        try
        {
            var apiElement = _apiElementBuilder.Build(element.Element);
            ApiElementPatcher.PatchNullProperties(apiElement, element.RawJson);
            return apiElement;
        }
        catch (Exception e)
        {
            throw new BlockPreviewException($"Could not build the Delivery API model for '{element.Element.ContentType.Alias}': {e.Message}", 500, e);
        }
    }

    private string? EditorAliasFor(Guid contentTypeKey, string propertyAlias)
    {
        var contentType = GetContentType(contentTypeKey);
        if (contentType == null)
        {
            _logger.LogDebug("BlockPreview: content type {ContentTypeKey} referenced by nested block data was not found.", contentTypeKey);
            return null;
        }

        return contentType.PropertyTypes.FirstOrDefault(p => p.Alias == propertyAlias)?.PropertyEditorAlias;
    }

    private IContentType? GetContentType(Guid key)
    {
        if (!_contentTypes.TryGetValue(key, out var contentType))
            _contentTypes[key] = contentType = _contentTypeService.Get(key);
        return contentType;
    }
}
