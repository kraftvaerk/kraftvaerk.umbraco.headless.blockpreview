namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.PreviewStylesheets;

/// <summary>
/// Serves the site's stylesheets in a form that works inside the backoffice preview's shadow DOM.
/// </summary>
public interface IPreviewStylesheetService
{
    /// <summary>
    /// Returns the configured stylesheets concatenated, with <c>:root</c> custom properties inlined and
    /// <c>html</c>, <c>body</c> and <c>:root</c> selectors rewritten to <c>.__block-preview</c>.
    /// Returns null when no stylesheets are configured or none could be read.
    /// </summary>
    string? GetResolvedCss();

    /// <summary>
    /// Applies the shadow-DOM rewrite to a single stylesheet's content. Exposed so consumers can reuse it for their own endpoints.
    /// </summary>
    string Transform(string css);
}
