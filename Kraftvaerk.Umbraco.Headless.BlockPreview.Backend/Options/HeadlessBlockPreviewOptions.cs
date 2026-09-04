namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;

public class HeadlessBlockPreviewOptions
{
    public const string SectionName = "HeadlessBlockPreview";

    /// <summary>
    /// Base URL of the frontend that renders previews. Only used when <see cref="UseMVC"/> is false.
    /// </summary>
    public string Host { get; set; } = string.Empty;

    /// <summary>
    /// Relative path (combined with <see cref="Host"/>) that receives the preview POST. Only used when <see cref="UseMVC"/> is false.
    /// </summary>
    public string Api { get; set; } = string.Empty;

    /// <summary>
    /// Shared secret sent in the <c>kuhb-header</c> request header. Only used when <see cref="UseMVC"/> is false.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Optional CSS selector used to extract part of the returned HTML.
    /// </summary>
    public string Selector { get; set; } = string.Empty;

    /// <summary>
    /// Optional HTML template wrapping the preview. <c>{{html}}</c> is replaced with the rendered block.
    /// </summary>
    public string Template { get; set; } = string.Empty;

    public bool EnableOutputCaching { get; set; } = false;

    /// <summary>
    /// When true, requests, responses and full exceptions are logged as warnings. Failures are always logged regardless of this flag.
    /// </summary>
    public bool Debug { get; set; }

    /// <summary>
    /// Seconds to wait for the frontend to return preview HTML before giving up. Only used when <see cref="UseMVC"/> is false.
    /// </summary>
    public int TimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// Maximum number of preview requests the backoffice will keep in flight at the same time per browser tab.
    /// </summary>
    public int MaxConcurrentPreviews { get; set; } = 6;

    /// <summary>
    /// When true, blocks are rendered in-process with Razor partial views instead of being posted to a headless frontend.
    /// <see cref="Host"/>, <see cref="Api"/> and <see cref="ApiKey"/> are ignored in that mode.
    /// </summary>
    public bool UseMVC { get; set; } = false;

    /// <summary>
    /// Folder that holds the Block Grid component partial views. Only used when <see cref="UseMVC"/> is true.
    /// </summary>
    public string BlockGridViewsPath { get; set; } = "~/Views/Partials/blockgrid/Components";

    /// <summary>
    /// Folder that holds the Block List component partial views. Only used when <see cref="UseMVC"/> is true.
    /// </summary>
    public string BlockListViewsPath { get; set; } = "~/Views/Partials/blocklist/Components";

    /// <summary>
    /// Folder that holds the Rich Text Editor block component partial views. Only used when <see cref="UseMVC"/> is true.
    /// </summary>
    public string RichTextViewsPath { get; set; } = "~/Views/Partials/richtext/Components";

    /// <summary>
    /// When true (default), href attributes in MVC-rendered previews are neutralised so anchors cannot navigate the backoffice away.
    /// Only used when <see cref="UseMVC"/> is true.
    /// </summary>
    public bool DisableLinks { get; set; } = true;

    /// <summary>
    /// Stylesheets (paths relative to wwwroot, e.g. "/css/site.css") that should be served through the package's
    /// <c>/api/v1/Kraftvaerk.Umbraco.Headless.Blockpreview/css</c> endpoint with <c>:root</c> custom properties inlined and
    /// <c>body</c>/<c>html</c> selectors rewritten to <c>.__block-preview</c>, so they work inside the backoffice's shadow DOM.
    /// </summary>
    public string[] Stylesheets { get; set; } = [];
}
