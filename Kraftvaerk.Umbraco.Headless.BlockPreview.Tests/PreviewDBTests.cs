using System.Text.Json;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.PreviewDB;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Services;
using Xunit;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Tests;

public class PreviewDBTests : IDisposable
{
    private readonly string _contentRoot = Path.Combine(Path.GetTempPath(), "blockpreview-tests", Guid.NewGuid().ToString("N"));
    private readonly IMemoryCache _cache = new MemoryCache(new MemoryCacheOptions());
    private readonly Mock<IContentTypeService> _contentTypes = new();

    public PreviewDBTests()
    {
        Directory.CreateDirectory(_contentRoot);
        _contentTypes.Setup(x => x.Get(It.IsAny<Guid>())).Returns((Guid key) =>
        {
            var ct = new Mock<IContentType>();
            ct.SetupGet(x => x.Key).Returns(key);
            ct.SetupGet(x => x.Alias).Returns("block" + key.ToString("N")[..6]);
            return ct.Object;
        });
    }

    public void Dispose()
    {
        try { Directory.Delete(_contentRoot, true); } catch { /* best effort */ }
    }

    private PreviewDB Create()
    {
        var env = new Mock<IWebHostEnvironment>();
        env.SetupGet(x => x.ContentRootPath).Returns(_contentRoot);
        // Transient in DI: every call site gets its own instance, all sharing the file and the cache.
        return new PreviewDB(env.Object, _contentTypes.Object, _cache, NullLogger<PreviewDB>.Instance);
    }

    private string StateFile => Path.Combine(_contentRoot, "blockpreview", "state.json");

    [Fact]
    public void Creates_an_empty_state_file_on_first_use()
    {
        Create();

        Assert.Equal("[]", System.IO.File.ReadAllText(StateFile));
    }

    [Fact]
    public void Set_persists_and_Get_reads_back_with_the_alias_filled_in()
    {
        var id = Guid.NewGuid();
        Create().Set(new HeadlessPreviewToggleModel { Id = id, Enabled = true, EnabledGrid = true });

        var stored = Create().Get(id);

        Assert.True(stored.Enabled);
        Assert.True(stored.EnabledGrid);
        Assert.False(stored.EnabledList);
        Assert.Equal("block" + id.ToString("N")[..6], stored.Alias);
        Assert.Single(JsonSerializer.Deserialize<List<HeadlessPreviewToggleModel>>(System.IO.File.ReadAllText(StateFile))!);
    }

    [Fact]
    public void Unknown_block_reads_as_disabled_and_is_not_written()
    {
        _contentTypes.Setup(x => x.Get(It.IsAny<Guid>())).Returns((IContentType?)null);
        var id = Guid.NewGuid();
        var db = Create();

        db.Set(new HeadlessPreviewToggleModel { Id = id, Enabled = true });

        Assert.False(db.Get(id).Enabled);
        Assert.Equal("[]", System.IO.File.ReadAllText(StateFile));
    }

    [Fact]
    public void Setting_the_same_block_twice_keeps_one_entry()
    {
        var id = Guid.NewGuid();
        var db = Create();

        db.Set(new HeadlessPreviewToggleModel { Id = id, Enabled = true });
        db.Set(new HeadlessPreviewToggleModel { Id = id, Enabled = false });

        Assert.Single(db.GetEnabled());
        Assert.False(db.Get(id).Enabled);
    }

    [Fact]
    public async Task Concurrent_toggles_from_many_instances_never_corrupt_the_file()
    {
        var ids = Enumerable.Range(0, 40).Select(_ => Guid.NewGuid()).ToList();

        await Task.WhenAll(ids.Select(id => Task.Run(() =>
            Create().Set(new HeadlessPreviewToggleModel { Id = id, Enabled = true, EnabledList = true }))));

        var onDisk = JsonSerializer.Deserialize<List<HeadlessPreviewToggleModel>>(System.IO.File.ReadAllText(StateFile))!;
        Assert.Equal(40, onDisk.Count);
        Assert.Equal(40, Create().GetEnabled().Count);
        Assert.Empty(Directory.GetFiles(Path.GetDirectoryName(StateFile)!, "*.tmp"));
    }
}
