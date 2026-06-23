using System.Reflection;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;

/// <summary>
/// Runtime proxy for IPublishedElement. Using DispatchProxy avoids compile-time interface binding,
/// so the same binary works across Umbraco versions regardless of which members IPublishedElement
/// exposes — v18 added 11 members that don't exist in v17, and future versions may add more.
/// </summary>
internal class PublishedElementProxy : DispatchProxy
{
    private IPublishedContentType _contentType = default!;
    private Guid _key;
    private List<IPublishedProperty> _properties = [];

    internal static IPublishedElement Create(
        IPublishedContentType contentType,
        Guid key,
        Dictionary<string, object?> values)
    {
        var proxy = Create<IPublishedElement, PublishedElementProxy>();
        var impl = (PublishedElementProxy)(object)proxy;
        impl._contentType = contentType;
        impl._key = key;
        impl._properties = contentType.PropertyTypes
            .Select(pt => (IPublishedProperty)new PreviewPublishedProperty(proxy, pt, values.GetValueOrDefault(pt.Alias)))
            .ToList();
        return proxy;
    }

    protected override object? Invoke(MethodInfo? targetMethod, object?[]? args) =>
        targetMethod?.Name switch
        {
            "get_ContentType" => _contentType,
            "get_Key"         => _key,
            "get_Properties"  => _properties,
            "GetProperty"     => _properties.FirstOrDefault(p =>
                                    p.Alias.Equals((string?)args?[0], StringComparison.OrdinalIgnoreCase)),

            // v18+ metadata members — IApiElementBuilder doesn't use these for element building
            "get_Id" or "get_SortOrder" or "get_CreatorId" or "get_WriterId" => 0,
            "get_Name"                 => string.Empty,
            "get_CreateDate" or "get_UpdateDate" => DateTime.MinValue,
            "get_Cultures"             => new Dictionary<string, PublishedCultureInfo>(),
            "get_ItemType"             => PublishedItemType.Element,
            "IsDraft"                  => true,
            "IsPublished"              => false,

            // Forward-compatible: return the type default for any member added in future Umbraco versions
            _ => targetMethod?.ReturnType.IsValueType == true
                    ? Activator.CreateInstance(targetMethod.ReturnType)
                    : null,
        };
}
