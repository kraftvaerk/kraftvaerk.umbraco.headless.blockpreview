using System.Text.Json;
using Umbraco.Cms.Core.Services;
using Microsoft.AspNetCore.Hosting;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.PreviewDB;
using Kraftvaerk.Umbraco.Headless.Blockpreview.Backend.PackageConstants;

namespace Kraftvaerk.Umbraco.Headless.Blockpreview.Backend.Services.PreviewDB;

public class PreviewDB : IPreviewDB
{
    private readonly IContentTypeService _contentTypeService;
    private readonly string _storagePath;
    private readonly string _filePath;

    public PreviewDB(IWebHostEnvironment env, IContentTypeService contentTypeService)
    {
        _contentTypeService = contentTypeService;

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
        var json = File.ReadAllText(_filePath);
        return JsonSerializer.Deserialize<List<HeadlessPreviewToggleModel>>(json) ?? new List<HeadlessPreviewToggleModel>();
    }

    private void WriteState(List<HeadlessPreviewToggleModel> aliases)
    {
        var json = JsonSerializer.Serialize(aliases.Distinct().ToList(), new JsonSerializerOptions { WriteIndented = true });
        File.WriteAllText(_filePath, json);
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

        var enabledAliases = ReadState();
        model.Alias = contentType.Alias;
        enabledAliases.RemoveAll(x => x.Id == model.Id);

        enabledAliases.Add(model);

        WriteState(enabledAliases);
    }
}
