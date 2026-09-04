using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.PackageConstants;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.PreviewStylesheets;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Controllers;

/// <summary>
/// Static-ish assets the preview needs. Deliberately anonymous: the backoffice loads the stylesheet through a plain
/// &lt;link&gt; tag inside the preview, which cannot carry a bearer token, and the source files live in wwwroot anyway.
/// </summary>
[AllowAnonymous]
[Route($"api/v1/{BlockPreviewConstants.PackageName}")]
public class PreviewAssets : ControllerBase
{
    private readonly IPreviewStylesheetService _stylesheets;

    public PreviewAssets(IPreviewStylesheetService stylesheets)
    {
        _stylesheets = stylesheets;
    }

    /// <summary>
    /// The stylesheets listed in HeadlessBlockPreview:Stylesheets, rewritten to work inside the backoffice preview.
    /// Reference it from the Template: &lt;link rel="stylesheet" href="/api/v1/Kraftvaerk.Umbraco.Headless.Blockpreview/css" /&gt;
    /// </summary>
    [HttpGet("css")]
    [ResponseCache(Duration = 300)]
    public IActionResult Css()
    {
        var css = _stylesheets.GetResolvedCss();
        if (css == null)
        {
            return new ContentResult
            {
                StatusCode = StatusCodes.Status404NotFound,
                ContentType = "text/plain",
                Content = "No stylesheets configured in HeadlessBlockPreview:Stylesheets, or none could be read.",
            };
        }

        return Content(css, "text/css");
    }
}
