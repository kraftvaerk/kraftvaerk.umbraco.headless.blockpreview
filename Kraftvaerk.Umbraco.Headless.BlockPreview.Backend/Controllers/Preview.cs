using System.Diagnostics;
using Asp.Versioning;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Exceptions;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.PackageConstants;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewCache;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewSettings;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.ContextCulture;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.DomainResolver;
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
using Umbraco.Cms.Web.Common.Authorization;

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
    private readonly IPreviewDomainResolver _domainResolver;
    private readonly IContextCultureService _contextCulture;
    private readonly ILogger<Preview> _logger;

    public Preview(
        IBlockHelper blockHelper,
        IRequestHelper requestHelper,
        IMvcBlockRenderer mvcRenderer,
        IPreviewDB previewDB,
        IBlockPreviewSettings settings,
        IBlockPreviewCache cache,
        IPreviewDomainResolver domainResolver,
        IContextCultureService contextCulture,
        ILogger<Preview> logger)
    {
        _blockHelper = blockHelper;
        _requestHelper = requestHelper;
        _mvcRenderer = mvcRenderer;
        _previewDB = previewDB;
        _settings = settings;
        _cache = cache;
        _domainResolver = domainResolver;
        _contextCulture = contextCulture;
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

        var pageId = ParseKey(preview.Id);
        var editor = ParseEditor(preview.Editor);

        var options = _settings.Options(pageId, preview.Culture, null);
        string? resolvedDomain = null;
        var target = "(unresolved)";

        try
        {
            if (options.EnableOutputCaching && _cache.TryGet(preview, out var cachedHtml))
                return Ok(new BlockPreviewResponse { Html = cachedHtml });

            resolvedDomain = _domainResolver.Resolve(pageId, preview.Culture);
            options = _settings.Options(pageId, preview.Culture, resolvedDomain);
            target = options.UseMVC ? "mvc" : $"{options.Host}{options.Api}";

            // Must happen before any property value is resolved, otherwise nested blocks and dictionary values
            // come out in the default language on multilanguage sites.
            _contextCulture.SetCulture(preview.Culture);

            var content = _blockHelper.BuildElement(preview.Content, preview.ContentType, ParseKey(preview.ContentKey))
                ?? throw new BlockPreviewException("Could not create an element from the block content.", 400);
            var settings = _blockHelper.BuildElement(preview.Settings, preview.SettingsType);

            var html = options.UseMVC
                ? await RenderWithMvc(preview, content, settings, editor, pageId, options)
                : await RenderWithFrontend(preview, content, settings, pageId, options);

            html = ApplySelectorAndTemplate(html, options, correlationId, content.Element.ContentType.Alias);
            html = _settings.FinalHtmlManipulation(html, pageId, preview.Culture, resolvedDomain);

            if (options.EnableOutputCaching)
                _cache.Set(preview, html);

            if (options.Debug)
            {
                _logger.LogWarning(
                    "BlockPreview Debug [{CorrelationId}]: rendered {ContentType} ({Editor}) page={PageId} culture={Culture} domain={Domain} target={Target} in {Elapsed}ms ({Bytes} bytes).",
                    correlationId, content.Element.ContentType.Alias, editor, pageId, preview.Culture, resolvedDomain, target, stopwatch.ElapsedMilliseconds, html.Length);
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

    private Task<string> RenderWithMvc(BlockPreviewFrontendModel preview, BlockElement content, BlockElement? settings, BlockEditorKind editor, Guid? pageId, HeadlessBlockPreviewOptions options) =>
        _mvcRenderer.RenderAsync(new MvcBlockRenderRequest
        {
            Content = content.Element,
            Settings = settings?.Element,
            Editor = editor,
            PageKey = pageId,
            Culture = preview.Culture,
            ColumnSpan = preview.ColumnSpan,
            RowSpan = preview.RowSpan,
            Options = options,
        });

    private Task<string> RenderWithFrontend(BlockPreviewFrontendModel preview, BlockElement content, BlockElement? settings, Guid? pageId, HeadlessBlockPreviewOptions options) =>
        _requestHelper.Post(new BlockPreviewBackendModel
        {
            Content = _blockHelper.BuildApiElement(content),
            Settings = settings == null ? null : _blockHelper.BuildApiElement(settings),
            RawContent = content.RawData,
            RawSettings = settings?.RawData ?? [],
            Key = pageId ?? Guid.Empty,
            Culture = preview.Culture,
        }, options, HttpContext.RequestAborted);

    private string ApplySelectorAndTemplate(string html, HeadlessBlockPreviewOptions options, string correlationId, string contentTypeAlias)
    {
        if (!string.IsNullOrWhiteSpace(options.Selector))
        {
            var trimmed = _requestHelper.TrimByCssSelector(html, options.Selector);
            if (trimmed == null)
            {
                _logger.LogWarning(
                    "BlockPreview [{CorrelationId}]: selector '{Selector}' matched nothing in the response for {ContentType}. Check HeadlessBlockPreview:Selector.",
                    correlationId, options.Selector, contentTypeAlias);
            }
            html = trimmed ?? string.Empty;
        }

        if (!string.IsNullOrEmpty(options.Template) && options.Template.Contains(BlockPreviewConstants.HtmlReplace))
            html = options.Template.Replace(BlockPreviewConstants.HtmlReplace, html);

        return html;
    }

    private static Guid? ParseKey(string? value) =>
        Guid.TryParse(value, out var key) && key != Guid.Empty ? key : null;

    private static BlockEditorKind ParseEditor(string? editor) => editor?.Trim().ToLowerInvariant() switch
    {
        "list" => BlockEditorKind.List,
        "rte" or "richtext" => BlockEditorKind.RichText,
        _ => BlockEditorKind.Grid,
    };

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

    private static ObjectResult PreviewProblem(string detail, int status, string correlationId)
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
