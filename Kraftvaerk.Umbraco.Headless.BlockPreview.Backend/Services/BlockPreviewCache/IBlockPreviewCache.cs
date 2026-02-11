using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewCache;

public interface IBlockPreviewCache
{
    bool TryGet(BlockPreviewFrontendModel model, out string? html);
    void Set(BlockPreviewFrontendModel model, string html);
}
