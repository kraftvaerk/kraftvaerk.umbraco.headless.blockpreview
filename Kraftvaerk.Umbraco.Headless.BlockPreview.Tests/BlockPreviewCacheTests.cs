using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewCache;
using Microsoft.Extensions.Caching.Memory;
using Xunit;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Tests;

public class BlockPreviewCacheTests
{
    private static BlockPreviewFrontendModel Request(string content = "{\"a\":1}", string? culture = "da-DK", string editor = "grid", int? columnSpan = 12) => new()
    {
        Id = "1d649970-2c0a-4df0-8422-94492edf6e9f",
        ContentType = "fb1c626d-b539-49be-9295-412f1bfe462a",
        SettingsType = "",
        Content = content,
        Settings = "{}",
        Culture = culture,
        Editor = editor,
        ColumnSpan = columnSpan,
        RowSpan = 1,
    };

    [Fact]
    public void Identical_requests_share_an_entry()
    {
        var cache = new BlockPreviewCache(new MemoryCache(new MemoryCacheOptions()));

        cache.Set(Request(), "<div/>");

        Assert.True(cache.TryGet(Request(), out var html));
        Assert.Equal("<div/>", html);
    }

    [Fact]
    public void Content_culture_editor_and_layout_all_take_part_in_the_key()
    {
        var cache = new BlockPreviewCache(new MemoryCache(new MemoryCacheOptions()));
        cache.Set(Request(), "<div/>");

        Assert.False(cache.TryGet(Request(content: "{\"a\":2}"), out _));
        Assert.False(cache.TryGet(Request(culture: "en-US"), out _));
        Assert.False(cache.TryGet(Request(editor: "list"), out _));
        Assert.False(cache.TryGet(Request(columnSpan: 6), out _));
    }
}
