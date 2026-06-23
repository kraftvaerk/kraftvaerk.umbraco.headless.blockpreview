using Asp.Versioning;
using Kraftvaerk.Umbraco.Headless.Blockpreview.Backend.PackageConstants;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewCache;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewSettings;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.PreviewDB;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.RequestHelper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Common.Filters;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Web.Common;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Controllers;

[ApiController]
[ApiVersion("1.0")]
[MapToApi($"{BlockPreviewConstants.PackageName}-api-v1")]
//[Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]

[JsonOptionsName(Constants.JsonOptionsNames.BackOffice)]
[Route($"api/v1/{BlockPreviewConstants.PackageName}")]

public class Preview : Controller
{
    private readonly IBlockHelper _blockHelper;
    private readonly IRequestHelper _requestHelper;
    private readonly IPreviewDB _previewDB;
    private readonly IBlockPreviewSettings _settings;
    private readonly IBlockPreviewCache _cache;
    private readonly IUmbracoHelperAccessor _umbracoHelperAccessor;
    private readonly ILogger<Preview> _logger;

    public Preview(
        IBlockHelper blockHelper,
        IRequestHelper requestHelper,
        IPreviewDB previewDB,
        IBlockPreviewSettings settings,
        IBlockPreviewCache cache,
        IUmbracoHelperAccessor umbracoHelperAccessor,
        ILogger<Preview> logger)
    {
        _blockHelper = blockHelper;
        _requestHelper = requestHelper;
        _previewDB = previewDB;
        _settings = settings;
        _cache = cache;
        _umbracoHelperAccessor = umbracoHelperAccessor;
        _logger = logger;
    }

    [HttpPost]
    [ApiVersionNeutral]
    public async Task<IActionResult> GetPreview([FromBody] BlockPreviewFrontendModel preview)
    {
        if (preview == null || preview.Content == null || preview.ContentType == null)
        {
            _logger.LogWarning("BlockPreview: Received invalid or incomplete preview request (null preview, content, or contentType).");
            return BadRequest("Invalid preview data provided.");
        }

        var globalOptions = _settings.Options(null, preview.Culture, null);

        if (globalOptions.EnableOutputCaching && _cache.TryGet(preview, out var cachedHtml))
            return Ok(new { html = cachedHtml });

        IApiElement? content;
        IApiElement? settings;
        Dictionary<string, object?> rawContent;
        Dictionary<string, object?> rawSettings;
        try
        {
            (content, rawContent) = _blockHelper.BlockContent(preview.Content, preview.ContentType);
            (settings, rawSettings) = _blockHelper.BlockContent(preview.Settings, preview.SettingsType);
        }
        catch (Exception e)
        {
            if (globalOptions.Debug)
                _logger.LogWarning(e, "BlockPreview Debug: Exception in BlockHelper for contentType {ContentType}.", preview.ContentType);
            return Problem(e.Message);
        }

        if (content == null)
        {
            if (globalOptions.Debug)
                _logger.LogWarning("BlockPreview Debug: BlockHelper returned null element for contentType {ContentType}.", preview.ContentType);
            return BadRequest("Could not create IApiElement from Content");
        }

        var model = new BlockPreviewBackendModel()
        {
            Content = content,
            Settings = settings,
            RawContent = rawContent,
            RawSettings = rawSettings,
            Key = !string.IsNullOrEmpty(preview.Id) ? Guid.Parse(preview.Id) : Guid.Empty
        };

        // Resolve the domain from the page URL so options can vary per site
        Guid? pageId = preview.Id != null ? Guid.Parse(preview.Id) : null;
        string? resolvedDomain = null;
        if (pageId.HasValue)
        {
            _umbracoHelperAccessor.TryGetUmbracoHelper(out var umbracoHelper);
            if (umbracoHelper != null)
            {
                var url = umbracoHelper.Content(pageId.Value)?.Url(preview.Culture, UrlMode.Absolute);
                if (url != null)
                    resolvedDomain = new Uri(url).Host;
            }
        }

        var options = _settings.Options(pageId, preview.Culture, resolvedDomain);

        try
        {
            var result = await _requestHelper.Post(model, options);

            var html = options.Selector != null
                ? _requestHelper.TrimByCssSelector(result ?? "", options.Selector)
                : result;

            if (html == null && options.Selector != null && options.Debug)
                _logger.LogWarning("BlockPreview Debug: CSS selector '{Selector}' matched nothing in the frontend response.", options.Selector);

            if (options.Template != null && options.Template.Contains(BlockPreviewConstants.HtmlReplace))
                html = options.Template.Replace(BlockPreviewConstants.HtmlReplace, html);

            html = _settings.FinalHtmlManipulation(html ?? "", pageId, preview.Culture, resolvedDomain);

            if (options.EnableOutputCaching && html != null)
                _cache.Set(preview, html);

            return Ok(new { html });
        }
        catch (Exception e)
        {
            if (options.Debug)
                _logger.LogWarning(e, "BlockPreview Debug: Exception posting preview for contentType {ContentType} to {Host}.", preview.ContentType, options.Host);
            return Problem(e.Message);
        }
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
}
