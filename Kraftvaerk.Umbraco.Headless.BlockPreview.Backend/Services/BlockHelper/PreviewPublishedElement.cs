using Umbraco.Cms.Core.Models.PublishedContent;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;

internal sealed class PreviewPublishedElement : IPublishedElement
{
    private readonly List<IPublishedProperty> _properties;

    public PreviewPublishedElement(IPublishedContentType contentType, Guid key, Dictionary<string, object?> values)
    {
        ContentType = contentType;
        Key = key;
        _properties = contentType.PropertyTypes
            .Select(pt => (IPublishedProperty)new PreviewPublishedProperty(this, pt, values.GetValueOrDefault(pt.Alias)))
            .ToList();
    }

    public IPublishedContentType ContentType { get; }
    public Guid Key { get; }
    public IEnumerable<IPublishedProperty> Properties => _properties;

    public IPublishedProperty? GetProperty(string alias) =>
        _properties.FirstOrDefault(p => p.Alias.Equals(alias, StringComparison.OrdinalIgnoreCase));

    // Metadata members added in v18 — not used by IApiElementBuilder, safe defaults
    public int Id => 0;
    public string Name => string.Empty;
    public int SortOrder => 0;
    public int CreatorId => 0;
    public DateTime CreateDate => DateTime.MinValue;
    public int WriterId => 0;
    public DateTime UpdateDate => DateTime.MinValue;
    public IReadOnlyDictionary<string, PublishedCultureInfo> Cultures => new Dictionary<string, PublishedCultureInfo>();
    public PublishedItemType ItemType => PublishedItemType.Element;
    public bool IsDraft(string? culture = null) => true;
    public bool IsPublished(string? culture = null) => false;
}
