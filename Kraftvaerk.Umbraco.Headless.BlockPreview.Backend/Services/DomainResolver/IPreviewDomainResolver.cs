namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.DomainResolver;

/// <summary>
/// Finds the host name of the site a document belongs to, so <see cref="BlockPreviewSettings.IBlockPreviewSettings"/>
/// can vary options per site.
/// </summary>
public interface IPreviewDomainResolver
{
    /// <summary>
    /// Returns the host of the page's absolute URL, falling back to the nearest routable ancestor when the page itself
    /// cannot be routed (unpublished, no domain, snapshot not updated yet). Never throws; returns null when unknown.
    /// </summary>
    string? Resolve(Guid? pageKey, string? culture);
}
