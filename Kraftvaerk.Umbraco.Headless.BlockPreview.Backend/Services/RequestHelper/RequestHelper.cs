using System.Text;
using System.Text.Json;
using HtmlAgilityPack;
using Microsoft.Extensions.Logging;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Exceptions;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;
using Kraftvaerk.Umbraco.Headless.Blockpreview.Backend.PackageConstants;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.RequestHelper;
public class RequestHelper : IRequestHelper
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<RequestHelper> _logger;

    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public RequestHelper(IHttpClientFactory httpClientFactory, ILogger<RequestHelper> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<string> Post(BlockPreviewBackendModel model, HeadlessBlockPreviewOptions previewOptions, CancellationToken cancellationToken = default)
    {
        var url = $"{previewOptions.Host}{previewOptions.Api}";
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            throw new BlockPreviewException(
                $"HeadlessBlockPreview:Host and :Api do not combine into an absolute http(s) URL ('{url}'). Set UseMVC to true to render with Razor views instead.", 500);
        }

        var timeoutSeconds = previewOptions.TimeoutSeconds > 0 ? previewOptions.TimeoutSeconds : 30;
        var json = JsonSerializer.Serialize(model, _jsonOptions);

        if (previewOptions.Debug)
            _logger.LogWarning("BlockPreview Debug: POST {Url} ({Bytes} bytes, timeout {Timeout}s)", uri, json.Length, timeoutSeconds);

        var client = _httpClientFactory.CreateClient(BlockPreviewConstants.HttpClientName);

        using var request = new HttpRequestMessage(HttpMethod.Post, uri)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json"),
        };
        if (!string.IsNullOrEmpty(previewOptions.ApiKey))
            request.Headers.TryAddWithoutValidation(BlockPreviewConstants.DefaultHeader, previewOptions.ApiKey);

        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

        try
        {
            using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cts.Token);
            var body = await response.Content.ReadAsStringAsync(cts.Token);

            if (!response.IsSuccessStatusCode)
            {
                throw new BlockPreviewException(
                    $"Frontend at {uri} responded {(int)response.StatusCode} {response.StatusCode}. {Truncate(body, 500)}".TrimEnd(), 502);
            }

            if (previewOptions.Debug)
                _logger.LogWarning("BlockPreview Debug: {Url} responded {StatusCode} with {Bytes} bytes", uri, (int)response.StatusCode, body.Length);

            return body;
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (OperationCanceledException e)
        {
            throw new BlockPreviewException($"Frontend at {uri} did not respond within {timeoutSeconds} seconds.", 504, e);
        }
        catch (HttpRequestException e)
        {
            throw new BlockPreviewException($"Could not reach frontend at {uri}: {e.Message}", 502, e);
        }
    }

    public string? TrimByCssSelector(string html, string selector) =>
        ExtractInnerHtml(html, selector);

    private static string? ExtractInnerHtml(string html, string selector)
    {
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        HtmlNode? node = selector switch
        {
            _ when selector.StartsWith('#') =>
                doc.DocumentNode.SelectSingleNode($"//*[@id='{selector[1..]}']"),
            _ when selector.StartsWith('.') =>
                doc.DocumentNode.SelectSingleNode($"//*[contains(concat(' ', normalize-space(@class), ' '), ' {selector[1..]} ')]"),
            _ when selector.Equals("body", StringComparison.OrdinalIgnoreCase) =>
                doc.DocumentNode.SelectSingleNode("//body"),
            _ => null,
        };

        return node?.InnerHtml;
    }

    private static string Truncate(string value, int max)
    {
        if (string.IsNullOrWhiteSpace(value)) return string.Empty;
        value = value.Trim();
        return value.Length <= max ? value : value[..max] + "…";
    }
}
