namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.ContextCulture;

/// <summary>
/// Puts the current request into the culture a block is being edited in, so nested content, dictionary lookups and
/// culture-variant values resolve in that language instead of the default one.
/// </summary>
public interface IContextCultureService
{
    /// <summary>
    /// Sets Umbraco's variation context and the thread culture. Invalid or empty cultures are ignored.
    /// </summary>
    void SetCulture(string? culture);
}
