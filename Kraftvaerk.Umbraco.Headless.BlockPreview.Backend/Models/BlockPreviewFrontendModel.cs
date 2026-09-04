namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models
{
    public class BlockPreviewFrontendModel
    {
        /// <summary>
        /// Key of the document being edited. May be null when the block is edited outside a document workspace.
        /// </summary>
        public string? Id { get; set; }
        public string? ContentType { get; set; }
        public string? SettingsType { get; set; }

        // These can be changed to more specific types if needed.
        public string? Content { get; set; }
        public string? Settings { get; set; }

        public string? Culture { get; set; }

        /// <summary>
        /// Which editor hosts the block: "grid", "list" or "rte". Used by MVC mode to pick the view folder and block item type.
        /// </summary>
        public string? Editor { get; set; }

        /// <summary>
        /// Key of the block content itself, so the rendered element carries the same key as in the editor.
        /// </summary>
        public string? ContentKey { get; set; }

        /// <summary>
        /// Block Grid layout hints. Ignored for other editors.
        /// </summary>
        public int? ColumnSpan { get; set; }
        public int? RowSpan { get; set; }
    }

}
