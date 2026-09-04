using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.RequestHelper;
public interface IRequestHelper
{
    /// <summary>
    /// Posts the block to the configured frontend and returns the HTML it responded with.
    /// Throws <see cref="Exceptions.BlockPreviewException"/> when the frontend cannot be reached, times out or responds with an error.
    /// </summary>
    Task<string> Post(BlockPreviewBackendModel model, HeadlessBlockPreviewOptions previewOptions, CancellationToken cancellationToken = default);

    string? TrimByCssSelector(string html, string selector);
}
