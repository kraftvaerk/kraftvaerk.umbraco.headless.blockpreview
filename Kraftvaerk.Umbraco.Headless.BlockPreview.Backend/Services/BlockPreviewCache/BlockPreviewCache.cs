using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
using Microsoft.Extensions.Caching.Memory;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewCache;

public class BlockPreviewCache : IBlockPreviewCache
{
    private readonly IMemoryCache _cache;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(24);
    private const string CacheKeyPrefix = "BlockPreview_";

    public BlockPreviewCache(IMemoryCache cache)
    {
        _cache = cache;
    }

    public bool TryGet(BlockPreviewFrontendModel model, out string? html)
    {
        var key = GenerateCacheKey(model);
        return _cache.TryGetValue(key, out html);
    }

    public void Set(BlockPreviewFrontendModel model, string html)
    {
        var key = GenerateCacheKey(model);
        _cache.Set(key, html, CacheDuration);
    }

    private static string GenerateCacheKey(BlockPreviewFrontendModel model)
    {
        var keyData = new
        {
            model.Id,
            model.ContentType,
            model.SettingsType,
            model.Content,
            model.Settings,
            model.Culture
        };

        var json = JsonSerializer.Serialize(keyData);
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(json));
        var hashString = Convert.ToBase64String(hash);

        return $"{CacheKeyPrefix}{hashString}";
    }
}
