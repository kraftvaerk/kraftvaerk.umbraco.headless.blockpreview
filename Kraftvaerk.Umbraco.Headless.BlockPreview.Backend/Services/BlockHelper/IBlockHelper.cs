using Newtonsoft.Json.Linq;
using Umbraco.Cms.Core.Models.DeliveryApi;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;

/// <summary>
/// A block's content or settings turned into something Umbraco can work with.
/// </summary>
public sealed class BlockElement
{
    /// <summary>
    /// The element as an <see cref="IPublishedElement"/>. Property values resolve through the normal value converters (preview mode).
    /// </summary>
    public required IPublishedElement Element { get; init; }

    /// <summary>
    /// Property alias to source value, as handed to the value converters.
    /// </summary>
    public required Dictionary<string, object?> RawData { get; init; }

    /// <summary>
    /// The normalised JSON the backoffice sent, used to patch nested block data that the Delivery API leaves null.
    /// </summary>
    public required JObject RawJson { get; init; }
}

public interface IBlockHelper
{
    /// <summary>
    /// Builds an <see cref="IPublishedElement"/> from the JSON the backoffice sent for a block.
    /// Returns null when <paramref name="content"/> or <paramref name="contentTypeGuidString"/> is empty.
    /// Throws <see cref="Exceptions.BlockPreviewException"/> when the data cannot be turned into an element.
    /// </summary>
    BlockElement? BuildElement(string? content, string? contentTypeGuidString, Guid? elementKey = null);

    /// <summary>
    /// Builds the Delivery API representation of an element produced by <see cref="BuildElement"/>.
    /// </summary>
    IApiElement BuildApiElement(BlockElement element);

    /// <summary>
    /// Convenience wrapper: <see cref="BuildElement"/> followed by <see cref="BuildApiElement"/>.
    /// Returns (null, empty) when there is no content to build from.
    /// </summary>
    (IApiElement? apiElement, Dictionary<string, object?> rawData) BlockContent(string? content, string? contentTypeGuidString);
}
