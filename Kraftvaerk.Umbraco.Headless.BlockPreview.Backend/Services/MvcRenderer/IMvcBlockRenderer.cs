using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.MvcRenderer;

/// <summary>
/// Which editor a block lives in. Decides the block item type handed to the view and the folder the view is looked up in.
/// </summary>
public enum BlockEditorKind
{
    Grid,
    List,
    RichText,
}

public sealed class MvcBlockRenderRequest
{
    public required IPublishedElement Content { get; init; }
    public IPublishedElement? Settings { get; init; }
    public BlockEditorKind Editor { get; init; } = BlockEditorKind.Grid;

    /// <summary>
    /// Key of the document being edited. When set, the view renders as if it were part of that page
    /// (<c>Umbraco.AssignedContentItem</c> and <c>UmbracoContext.PublishedRequest</c> point at it).
    /// </summary>
    public Guid? PageKey { get; init; }
    public string? Culture { get; init; }

    /// <summary>
    /// Grid layout hints from the backoffice. Only used for <see cref="BlockEditorKind.Grid"/>.
    /// </summary>
    public int? ColumnSpan { get; init; }
    public int? RowSpan { get; init; }

    public required HeadlessBlockPreviewOptions Options { get; init; }
}

/// <summary>
/// Renders a block to HTML in-process through the site's own Razor partial views.
/// </summary>
public interface IMvcBlockRenderer
{
    /// <summary>
    /// Renders the block. Throws <see cref="Exceptions.BlockPreviewException"/> when no view exists or the view fails.
    /// </summary>
    Task<string> RenderAsync(MvcBlockRenderRequest request);
}
