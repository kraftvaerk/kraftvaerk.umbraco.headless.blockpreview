namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;

/// <summary>
/// Runtime settings the backoffice extension needs to know about.
/// </summary>
public class BlockPreviewClientSettings
{
    public int MaxConcurrentPreviews { get; set; }
    public bool UseMVC { get; set; }
}
