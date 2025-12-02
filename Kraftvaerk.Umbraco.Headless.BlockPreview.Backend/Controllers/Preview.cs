using Asp.Versioning;
using Kraftvaerk.Umbraco.Headless.Blockpreview.Backend.PackageConstants;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewSettings;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.PreviewDB;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.RequestHelper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Api.Common.Filters;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Web.Common;
using Umbraco.Cms.Web.Common.Authorization;

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
    private readonly IUmbracoHelperAccessor _umbracoHelperAccessor;
    public Preview(
        IBlockHelper blockHelper, 
        IRequestHelper requestHelper, 
        IPreviewDB previewDB,
        IBlockPreviewSettings settings,
        IUmbracoHelperAccessor umbracoHelperAccessor)
    {
        _blockHelper = blockHelper;
        _requestHelper = requestHelper;
        _previewDB = previewDB;
        _settings = settings;
        _umbracoHelperAccessor = umbracoHelperAccessor;

    }

    [HttpPost]
    [ApiVersionNeutral]
    public async Task<IActionResult> GetPreview([FromBody] BlockPreviewFrontendModel preview)
    {
        if(preview == null || preview.Content == null || preview.ContentType == null)
        {
            return BadRequest("Invalid preview data provided.");
        }
        IApiElement? content = null;
        IApiElement? settings = null;

        try
        {
            content = _blockHelper.BlockContent(preview.Content, preview.ContentType);
            settings = _blockHelper.BlockContent(preview.Settings, preview.SettingsType);
        }
        catch(Exception e)
        {
            return Problem(e.Message);
        }

        if (content == null)
        {
            return BadRequest("Could not create IApiElement from Content");
        }

        var model = new BlockPreviewBackendModel() { Content = content, Settings = settings };
        try
        {
            Guid? pageId = preview.Id != null ? Guid.Parse(preview.Id) : null;
            string? resolvedDomain = null;
            if (pageId.HasValue)
            {
                _umbracoHelperAccessor.TryGetUmbracoHelper(out var umbracoHelper);

                if(umbracoHelper != null)
                {
                    var pageContent = umbracoHelper.Content(pageId.Value);
                    var url = pageContent?.Url(preview.Culture,UrlMode.Absolute);
                    if(url != null)
                    {
                        var uri = new Uri(url);
                        resolvedDomain = uri.Host;
                    }
                }
            }

            var options = _settings.Options(pageId, preview.Culture, resolvedDomain);

            var result = await _requestHelper.Post(model!, options);

            var html = string.Empty;


            if (options.Selector != null)
                html = _requestHelper.TrimByCssSelector(result ?? "", options.Selector);
            else html = result;

            if (options.Template != null && options.Template.Contains(BlockPreviewConstants.HtmlReplace))
                html = options.Template.Replace(BlockPreviewConstants.HtmlReplace, html);

            html = _settings.FinalHtmlManipulation(html ?? "", pageId, preview.Culture, resolvedDomain);

            return Ok(new { html });
        }
        catch(Exception e)
        {
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
        var response = _previewDB.Get(id);

        return Ok(response);
    }

    [HttpOptions]
    [ApiVersionNeutral]
    public IActionResult Enabled()
    {
        var response = _previewDB.GetEnabled();
        return Ok(response);
    }
}


