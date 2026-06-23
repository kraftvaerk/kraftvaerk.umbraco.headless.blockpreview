using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewSettings;
public interface IBlockPreviewSettings
{
    HeadlessBlockPreviewOptions Options(Guid? pageId, string? culture, string? resolvedDomain);

    string FinalHtmlManipulation(string html, Guid? pageId, string? culture, string? resolvedDomain);
}

