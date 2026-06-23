using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;

internal sealed class PreviewPublishedProperty : IPublishedProperty
{
    private readonly IPublishedElement _owner;
    private readonly object? _sourceValue;

    public PreviewPublishedProperty(IPublishedElement owner, IPublishedPropertyType propertyType, object? sourceValue)
    {
        _owner = owner;
        PropertyType = propertyType;
        _sourceValue = sourceValue;
    }

    public IPublishedPropertyType PropertyType { get; }
    public string Alias => PropertyType.Alias;

    public bool HasValue(string? culture = null, string? segment = null) => _sourceValue is not null;

    public object? GetSourceValue(string? culture = null, string? segment = null) => _sourceValue;

    public object? GetValue(string? culture = null, string? segment = null)
    {
        var inter = PropertyType.ConvertSourceToInter(_owner, _sourceValue, preview: true);
        return PropertyType.ConvertInterToObject(_owner, PropertyCacheLevel.None, inter, preview: true);
    }

    public object? GetDeliveryApiValue(bool expanding, string? culture = null, string? segment = null)
    {
        var inter = PropertyType.ConvertSourceToInter(_owner, _sourceValue, preview: true);
        return PropertyType.ConvertInterToDeliveryApiObject(_owner, PropertyCacheLevel.None, inter, preview: true, expanding);
    }
}
