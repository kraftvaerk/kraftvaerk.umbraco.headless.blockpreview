using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using HtmlAgilityPack;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
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
                if (previewOptions.Debug)
                {
                    _logger.LogWarning("BlockPreview Debug: Request to {Url} failed with status {StatusCode}", url, response.StatusCode);
                }
                return null;
            }

            var result = await response.Content.ReadAsStringAsync();

            if (previewOptions.Debug)
            {
                _logger.LogWarning("BlockPreview Debug: Received response from {Url}, length: {Length} chars", url, result?.Length ?? 0);
            }

            return result;
        }
    }

    public string? TrimByCssSelector(string html, string selector)
    {
        return ExtractInnerHtml(html, selector);
    }

    private string? ExtractInnerHtml(string html, string selector)
    {
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        HtmlNode? node = null;

        if (selector.StartsWith("#"))
        {
            var id = selector.Substring(1);
            node = doc.DocumentNode.SelectSingleNode($"//*[@id='{id}']");
        }
        else if (selector.StartsWith("."))
        {
            var className = selector.Substring(1);
            node = doc.DocumentNode.SelectSingleNode($"//*[contains(concat(' ', normalize-space(@class), ' '), ' {className} ')]");
        }
        else if (selector.Equals("body", StringComparison.OrdinalIgnoreCase))
        {

            node = doc.DocumentNode.SelectSingleNode("//body");

        }

        return node?.InnerHtml;
    }

}

