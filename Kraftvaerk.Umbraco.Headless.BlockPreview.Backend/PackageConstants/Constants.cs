namespace Kraftvaerk.Umbraco.Headless.Blockpreview.Backend.PackageConstants;
public static class BlockPreviewConstants
{
    public const string PackageName = "Kraftvaerk.Umbraco.Headless.Blockpreview";
    public const string HtmlReplace = "{{html}}";
    public const string BlockPreviewFolder = "blockpreview";
    public const string BlockStateFile = "state.json";
    public const string DefaultHeader = "kuhb-header";
    public const string HttpClientName = "fetch-headless-preview-by-post";

    /// <summary>
    /// Class the preview HTML is expected to be wrapped in. Stylesheets served by the package rewrite html/body/:root to it.
    /// </summary>
    public const string PreviewRootClass = "__block-preview";
}
