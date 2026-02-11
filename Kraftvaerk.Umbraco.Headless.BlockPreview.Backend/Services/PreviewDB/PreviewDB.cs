using System.Text.Json;
using Umbraco.Cms.Core.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.PreviewDB;
using Kraftvaerk.Umbraco.Headless.Blockpreview.Backend.PackageConstants;

namespace Kraftvaerk.Umbraco.Headless.Blockpreview.Backend.Services.PreviewDB;

public class PreviewDB : IPreviewDB
{
    private readonly IContentTypeService _contentTypeService;
    private readonly IMemoryCache _cache;
    private readonly string _storagePath;
    private readonly string _filePath;

    private const string CacheKey = "PreviewDB_State";

    public PreviewDB(IWebHostEnvironment env, IContentTypeService contentTypeService, IMemoryCache cache)
    {
        _contentTypeService = contentTypeService;
        _cache = cache;

        _storagePath = Path.Combine(env.ContentRootPath, BlockPreviewConstants.BlockPreviewFolder);
        _filePath = Path.Combine(_storagePath, BlockPreviewConstants.BlockStateFile);

        EnsureInitialized();
    }

    private void EnsureInitialized()
    {
        if (!Directory.Exists(_storagePath))
            Directory.CreateDirectory(_storagePath);

        if (!File.Exists(_filePath))
            File.WriteAllText(_filePath, "[]");
    }

    private List<HeadlessPreviewToggleModel> ReadState()
    {
        return _cache.GetOrCreate(CacheKey, entry =>
        {
            var json = File.ReadAllText(_filePath);
            return JsonSerializer.Deserialize<List<HeadlessPreviewToggleModel>>(json) ?? [];
        }) ?? [];
    }

    private void WriteState(List<HeadlessPreviewToggleModel> aliases)
    {
        var state = aliases.Distinct().ToList();
        var json = JsonSerializer.Serialize(state, new JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(_filePath, json);
        _cache.Set(CacheKey, state);
    }

    public HeadlessPreviewToggleModel Get(Guid blockId)
    {
        var contentType = _contentTypeService.Get(blockId);
        if (contentType == null)
            return new HeadlessPreviewToggleModel { Id = blockId, Enabled = false };

        var enabledAliases = ReadState();
        return enabledAliases.FirstOrDefault(x => x.Id == blockId) ?? new HeadlessPreviewToggleModel { Id = blockId, Enabled = false };
    }

    public List<HeadlessPreviewToggleModel> GetEnabled()
    {
        return ReadState();
    }

    public void Set(HeadlessPreviewToggleModel model)
    {
        var contentType = _contentTypeService.Get(model.Id);
        if (contentType == null)
            return;

        var enabledAliases = ReadState().ToList();
        model.Alias = contentType.Alias;
        enabledAliases.RemoveAll(x => x.Id == model.Id);

        enabledAliases.Add(model);

        WriteState(enabledAliases);
    }
}
