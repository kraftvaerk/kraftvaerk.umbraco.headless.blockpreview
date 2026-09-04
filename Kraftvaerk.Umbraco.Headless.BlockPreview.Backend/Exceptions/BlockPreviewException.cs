namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Exceptions;

/// <summary>
/// A preview could not be produced. The message is safe to show to a backoffice user.
/// </summary>
public class BlockPreviewException : Exception
{
    /// <summary>
    /// HTTP status code the preview endpoint should respond with. Defaults to 500.
    /// </summary>
    public int StatusCode { get; }

    public BlockPreviewException(string message, int statusCode = 500, Exception? inner = null)
        : base(message, inner)
    {
        StatusCode = statusCode;
    }
}
