using System.Text;
using System.Text.Json;
using HtmlAgilityPack;
using Microsoft.Extensions.Logging;
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


    public async Task<string?> Post(BlockPreviewBackendModel model, HeadlessBlockPreviewOptions previewOptions)
    {
        var secret = previewOptions.ApiKey;
        var header = BlockPreviewConstants.DefaultHeader;
        var url = $"{previewOptions.Host}{previewOptions.Api}";

        var json = JsonSerializer.Serialize(model, _jsonOptions);

        using (var client = _httpClientFactory.CreateClient("fetch-headless-preview-by-post"))
        {
            client.DefaultRequestHeaders.Add(header, secret);
            client.Timeout = TimeSpan.FromSeconds(10);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");
            using var response = await client.PostAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                var failureContent = await response.Content.ReadAsStringAsync();

                if (previewOptions.Debug)
                {
                    _logger.LogWarning("BlockPreview Debug: Request to {Url} failed with status {StatusCode}. Response body: {ResponseBody}", url, response.StatusCode, failureContent);
                }
                return null;
            }

            return await response.Content.ReadAsStringAsync();
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

}

