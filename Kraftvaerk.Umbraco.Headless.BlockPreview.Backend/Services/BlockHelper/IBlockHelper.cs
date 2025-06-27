using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;

public interface IBlockHelper
{
    IApiElement? BlockContent(string? content, string? contentTypeGuidString);
}


