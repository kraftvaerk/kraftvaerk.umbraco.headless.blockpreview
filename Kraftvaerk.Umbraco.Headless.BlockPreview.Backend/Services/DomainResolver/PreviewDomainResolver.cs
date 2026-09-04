using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.DomainResolver;

public class PreviewDomainResolver : IPreviewDomainResolver
{
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private readonly IPublishedUrlProvider _publishedUrlProvider;
    private readonly ILogger<PreviewDomainResolver> _logger;

    public PreviewDomainResolver(
        IUmbracoContextAccessor umbracoContextAccessor,
        IPublishedUrlProvider publishedUrlProvider,
        ILogger<PreviewDomainResolver> logger)
    {
        _umbracoContextAccessor = umbracoContextAccessor;
        _publishedUrlProvider = publishedUrlProvider;
        _logger = logger;
    }

    public string? Resolve(Guid? pageKey, string? culture)
    {
        if (pageKey is not { } key || key == Guid.Empty)
            return null;

        try
        {
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext))
                return null;

            var page = umbracoContext.Content?.GetById(true, key);
            if (page == null)
            {
                _logger.LogDebug("BlockPreview: page {PageKey} was not found in the content cache; domain not resolved.", key);
                return null;
            }

            var host = HostOf(page, culture);
            if (host != null)
                return host;

            foreach (var ancestor in page.Ancestors())
            {
                host = HostOf(ancestor, culture);
                if (host != null)
                    return host;
            }

            _logger.LogDebug("BlockPreview: page {PageKey} has no routable URL for culture {Culture}; domain not resolved.", key, culture);
            return null;
        }
        catch (Exception e)
        {
            _logger.LogDebug(e, "BlockPreview: domain resolution for page {PageKey} failed; continuing without a domain.", key);
            return null;
        }
    }

    /// <summary>
    /// Umbraco returns "#" (not a URL) for content it cannot route, so the result is never assumed to be absolute.
    /// </summary>
    private string? HostOf(IPublishedContent content, string? culture)
    {
        try
        {
            var url = _publishedUrlProvider.GetUrl(content, UrlMode.Absolute, culture);
            if (Uri.TryCreate(url, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
                return uri.Host;
        }
        catch
        {
            // treated as unroutable
        }

        return null;
    }
}
