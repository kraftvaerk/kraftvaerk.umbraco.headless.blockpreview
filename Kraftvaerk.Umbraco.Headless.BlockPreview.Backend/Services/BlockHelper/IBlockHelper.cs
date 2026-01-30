using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;

public interface IBlockHelper
{
    (IApiElement? apiElement, Dictionary<string, object?> rawData) BlockContent(string? content, string? contentTypeGuidString);
}


