using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.RequestHelper;
public interface IRequestHelper
{
    Task<string?> Post(BlockPreviewBackendModel model, HeadlessBlockPreviewOptions previewOptions);

    string? TrimByCssSelector(string html, string selector);
}

