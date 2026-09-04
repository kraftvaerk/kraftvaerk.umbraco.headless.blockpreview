using System.Diagnostics;
using Asp.Versioning;
using Kraftvaerk.Umbraco.Headless.Blockpreview.Backend.PackageConstants;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Exceptions;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewCache;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewSettings;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.MvcRenderer;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.PreviewDB;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.RequestHelper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Common.Filters;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Extensions;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Controllers;

[ApiController]
[ApiVersion("1.0")]
[MapToApi($"{BlockPreviewConstants.PackageName}-api-v1")]
[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
[JsonOptionsName(Constants.JsonOptionsNames.BackOffice)]
[Route($"api/v1/{BlockPreviewConstants.PackageName}")]
public class Preview : Controller
{
    private readonly IBlockHelper _blockHelper;
    private readonly IRequestHelper _requestHelper;
    private readonly IMvcBlockRenderer _mvcRenderer;
    private readonly IPreviewDB _previewDB;
    private readonly IBlockPreviewSettings _settings;
    private readonly IBlockPreviewCache _cache;
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private readonly IPublishedUrlProvider _publishedUrlProvider;
    private readonly ILogger<Preview> _logger;

    public Preview(
        IBlockHelper blockHelper,
        IRequestHelper requestHelper,
        IMvcBlockRenderer mvcRenderer,
        IPreviewDB previewDB,
        IBlockPreviewSettings settings,
        IBlockPreviewCache cache,
        IUmbracoContextAccessor umbracoContextAccessor,
        IPublishedUrlProvider publishedUrlProvider,
        ILogger<Preview> logger)
    {
        _blockHelper = blockHelper;
        _requestHelper = requestHelper;
        _mvcRenderer = mvcRenderer;
        _previewDB = previewDB;
        _settings = settings;
        _cache = cache;
        _umbracoContextAccessor = umbracoContextAccessor;
        _publishedUrlProvider = publishedUrlProvider;
        _logger = logger;
    }

    [HttpPost]
    [ApiVersionNeutral]
    [ProducesResponseType(typeof(BlockPreviewResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetPreview([FromBody] BlockPreviewFrontendModel preview)
    {
        var correlationId = Guid.NewGuid().ToString("N")[..8];
        var stopwatch = Stopwatch.StartNew();

        if (preview == null || string.IsNullOrWhiteSpace(preview.Content) || string.IsNullOrWhiteSpace(preview.ContentType))
        {
            _logger.LogWarning("BlockPreview [{CorrelationId}]: rejected preview request without content or contentType.", correlationId);
            return PreviewProblem("Invalid preview data provided.", 400, correlationId);
        }

        Guid? pageId = Guid.TryParse(preview.Id, out var parsedPageId) && parsedPageId != Guid.Empty ? parsedPageId : null;
        var editor = ParseEditor(preview.Editor);

        HeadlessBlockPreviewOptions options = _settings.Options(pageId, preview.Culture, null);
        string? resolvedDomain = null;
        string target = "(unresolved)";

        try
        {
            if (options.EnableOutputCaching && _cache.TryGet(preview, out var cachedHtml))
                return Ok(new BlockPreviewResponse { Html = cachedHtml });

            resolvedDomain = ResolveDomain(pageId, preview.Culture, options.Debug);
            options = _settings.Options(pageId, preview.Culture, resolvedDomain);
            target = options.UseMVC ? "mvc" : $"{options.Host}{options.Api}";

            Guid? contentKey = Guid.TryParse(preview.ContentKey, out var parsedContentKey) && parsedContentKey != Guid.Empty ? parsedContentKey : null;

            var contentElement = _blockHelper.BuildElement(preview.Content, preview.ContentType, contentKey)
                ?? throw new BlockPreviewException("Could not create an element from the block content.", 400);
            var settingsElement = _blockHelper.BuildElement(preview.Settings, preview.SettingsType);

            string? html;
            if (options.UseMVC)
            {
                html = await _mvcRenderer.RenderAsync(new MvcBlockRenderRequest
                {
                    Content = contentElement.Element,
                    Settings = settingsElement?.Element,
                    Editor = editor,
                    PageKey = pageId,
                    Culture = preview.Culture,
                    ColumnSpan = preview.ColumnSpan,
                    RowSpan = preview.RowSpan,
                    Options = options,
                });
            }
            else
            {
                var model = new BlockPreviewBackendModel
                {
                    Content = _blockHelper.BuildApiElement(contentElement),
                    Settings = settingsElement == null ? null : _blockHelper.BuildApiElement(settingsElement),
                    RawContent = contentElement.RawData,
                    RawSettings = settingsElement?.RawData ?? [],
                    Key = pageId ?? Guid.Empty,
                };

                html = await _requestHelper.Post(model, options, HttpContext.RequestAborted);
            }

            if (!string.IsNullOrWhiteSpace(options.Selector))
            {
                var trimmed = _requestHelper.TrimByCssSelector(html ?? string.Empty, options.Selector);
                if (trimmed == null)
                {
                    _logger.LogWarning(
                        "BlockPreview [{CorrelationId}]: selector '{Selector}' matched nothing in the response for {ContentType}. Check HeadlessBlockPreview:Selector.",
                        correlationId, options.Selector, contentElement.Element.ContentType.Alias);
                }
                html = trimmed ?? string.Empty;
            }

            if (!string.IsNullOrEmpty(options.Template) && options.Template.Contains(BlockPreviewConstants.HtmlReplace))
                html = options.Template.Replace(BlockPreviewConstants.HtmlReplace, html ?? string.Empty);

            html = _settings.FinalHtmlManipulation(html ?? string.Empty, pageId, preview.Culture, resolvedDomain);

            if (options.EnableOutputCaching)
                _cache.Set(preview, html);

            if (options.Debug)
            {
                _logger.LogWarning(
                    "BlockPreview Debug [{CorrelationId}]: rendered {ContentType} ({Editor}) page={PageId} culture={Culture} domain={Domain} target={Target} in {Elapsed}ms ({Bytes} bytes).",
                    correlationId, contentElement.Element.ContentType.Alias, editor, pageId, preview.Culture, resolvedDomain, target, stopwatch.ElapsedMilliseconds, html.Length);
            }

            return Ok(new BlockPreviewResponse { Html = html });
        }
        catch (OperationCanceledException) when (HttpContext.RequestAborted.IsCancellationRequested)
        {
            // The backoffice moved on (block edited again / navigated away). Nothing to log, nothing to render.
            return StatusCode(499);
        }
        catch (BlockPreviewException e)
        {
            LogFailure(e, e.StatusCode, correlationId, preview, editor, pageId, resolvedDomain, target, stopwatch, options.Debug);
            return PreviewProblem(e.Message, e.StatusCode, correlationId);
        }
        catch (Exception e)
        {
            LogFailure(e, 500, correlationId, preview, editor, pageId, resolvedDomain, target, stopwatch, debug: true);
            return PreviewProblem(e.Message, 500, correlationId);
        }
    }

    [HttpGet("settings")]
    [ApiVersionNeutral]
    [ProducesResponseType(typeof(BlockPreviewClientSettings), StatusCodes.Status200OK)]
    public ActionResult<BlockPreviewClientSettings> GetSettings()
    {
        var options = _settings.Options(null, null, null);
        return Ok(new BlockPreviewClientSettings
        {
            MaxConcurrentPreviews = options.MaxConcurrentPreviews > 0 ? options.MaxConcurrentPreviews : 6,
            UseMVC = options.UseMVC,
        });
    }

    [HttpPut]
    [ApiVersionNeutral]
    public IActionResult SetPreviewToggleState([FromBody] HeadlessPreviewToggleModel model)
    {
        _previewDB.Set(model);
        return Ok();
    }

    [HttpGet]
    [ApiVersionNeutral]
    public ActionResult<HeadlessPreviewToggleModel> GetPreviewToggleState([FromQuery] Guid id)
    {
        return Ok(_previewDB.Get(id));
    }

    [HttpOptions]
    [ApiVersionNeutral]
    public IActionResult Enabled()
    {
        return Ok(_previewDB.GetEnabled());
    }

    private static BlockEditorKind ParseEditor(string? editor) => editor?.Trim().ToLowerInvariant() switch
    {
        "list" => BlockEditorKind.List,
        "rte" or "richtext" => BlockEditorKind.RichText,
        _ => BlockEditorKind.Grid,
    };

    /// <summary>
    /// Finds the host name of the site the page belongs to, so <see cref="IBlockPreviewSettings"/> can vary options per site.
    /// Umbraco returns "#" (not a URL) for content it cannot route, e.g. unpublished pages, so this never assumes the URL is absolute.
    /// </summary>
    private string? ResolveDomain(Guid? pageId, string? culture, bool debug)
    {
        if (pageId is not { } key)
            return null;

        try
        {
            if (!_umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext))
                return null;

            var page = umbracoContext.Content?.GetById(true, key);
            if (page == null)
            {
                if (debug) _logger.LogWarning("BlockPreview Debug: page {PageId} was not found in the content cache; domain not resolved.", key);
                return null;
            }

            var host = HostOf(page, culture);
            if (host != null)
                return host;

            // Unpublished or otherwise unroutable page: the nearest routable ancestor tells us which site it lives on.
            foreach (var ancestor in page.Ancestors())
            {
                host = HostOf(ancestor, culture);
                if (host != null)
                    return host;
            }

            if (debug) _logger.LogWarning("BlockPreview Debug: page {PageId} has no routable URL for culture {Culture}; domain not resolved.", key, culture);
            return null;
        }
        catch (Exception e)
        {
            _logger.LogDebug(e, "BlockPreview: domain resolution for page {PageId} failed; continuing without a domain.", key);
            return null;
        }
    }

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

    private void LogFailure(
        Exception exception, int status, string correlationId, BlockPreviewFrontendModel preview, BlockEditorKind editor,
        Guid? pageId, string? resolvedDomain, string target, Stopwatch stopwatch, bool debug)
    {
        const string message =
            "BlockPreview [{CorrelationId}]: preview failed for contentType={ContentType} editor={Editor} page={PageId} culture={Culture} domain={Domain} target={Target} status={Status} after {Elapsed}ms: {Reason}";

        // Known failures carry a readable message; the stack trace only adds value when debugging.
        // Unexpected failures always get the full exception.
        if (debug)
            _logger.LogWarning(exception, message, correlationId, preview.ContentType, editor, pageId, preview.Culture, resolvedDomain, target, status, stopwatch.ElapsedMilliseconds, exception.Message);
        else
            _logger.LogWarning(message, correlationId, preview.ContentType, editor, pageId, preview.Culture, resolvedDomain, target, status, stopwatch.ElapsedMilliseconds, exception.Message);
    }

    private ObjectResult PreviewProblem(string detail, int status, string correlationId)
    {
        var problem = new ProblemDetails
        {
            Title = "Block preview failed",
            Detail = detail,
            Status = status,
        };
        problem.Extensions["correlationId"] = correlationId;
        return new ObjectResult(problem) { StatusCode = status };
    }
}
