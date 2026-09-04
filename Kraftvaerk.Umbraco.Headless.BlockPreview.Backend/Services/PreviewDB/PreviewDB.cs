using System.Text.Json;
using Umbraco.Cms.Core.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.PackageConstants;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.PreviewDB;

public class PreviewDB : IPreviewDB
{
    private readonly IContentTypeService _contentTypeService;
    private readonly IMemoryCache _cache;
    private readonly ILogger<PreviewDB> _logger;
    private readonly string _storagePath;
    private readonly string _filePath;

    private const string CacheKey = "PreviewDB_State";

    // The service is transient but the file is shared, so serialise all access process-wide.
    private static readonly object FileLock = new();

    private static readonly JsonSerializerOptions WriteOptions = new() { WriteIndented = true };

    public PreviewDB(IWebHostEnvironment env, IContentTypeService contentTypeService, IMemoryCache cache, ILogger<PreviewDB> logger)
    {
        _contentTypeService = contentTypeService;
        _cache = cache;
        _logger = logger;

        _storagePath = Path.Combine(env.ContentRootPath, BlockPreviewConstants.BlockPreviewFolder);
        _filePath = Path.Combine(_storagePath, BlockPreviewConstants.BlockStateFile);

        EnsureInitialized();
    }

    private void EnsureInitialized()
    {
        lock (FileLock)
        {
            if (!Directory.Exists(_storagePath))
                Directory.CreateDirectory(_storagePath);

            if (!File.Exists(_filePath))
                File.WriteAllText(_filePath, "[]");
        }
    }

    private List<HeadlessPreviewToggleModel> ReadState()
    {
        if (_cache.TryGetValue(CacheKey, out List<HeadlessPreviewToggleModel>? cached) && cached != null)
            return cached;

        lock (FileLock)
        {
            if (_cache.TryGetValue(CacheKey, out cached) && cached != null)
                return cached;

            var state = WithRetry(() =>
            {
                var json = File.ReadAllText(_filePath);
                return JsonSerializer.Deserialize<List<HeadlessPreviewToggleModel>>(json) ?? [];
            });

            _cache.Set(CacheKey, state);
            return state;
        }
    }

    private void WriteState(List<HeadlessPreviewToggleModel> aliases)
    {
        var state = aliases.Distinct().ToList();
        var json = JsonSerializer.Serialize(state, WriteOptions);

        lock (FileLock)
        {
            // Write to a sibling temp file and swap it in, so a reader never sees a half-written file.
            var tempPath = _filePath + "." + Guid.NewGuid().ToString("N") + ".tmp";
            try
            {
                File.WriteAllText(tempPath, json);
                try
                {
                    WithRetry(() =>
                    {
                        File.Move(tempPath, _filePath, overwrite: true);
                        return true;
                    });
                }
                catch (Exception e) when (e is IOException or UnauthorizedAccessException)
                {
                    // Windows can refuse to replace a file that another process (indexer, antivirus, an IDE) still
                    // holds open. Losing atomicity beats losing the toggle, so write in place as a last resort.
                    _logger.LogDebug(e, "BlockPreview: could not swap the state file into place, writing it directly.");
                    WithRetry(() =>
                    {
                        File.WriteAllText(_filePath, json);
                        return true;
                    });
                }
            }
            finally
            {
                try { File.Delete(tempPath); } catch { /* already moved or never written */ }
            }

            _cache.Set(CacheKey, state);
        }
    }

    private T WithRetry<T>(Func<T> action)
    {
        const int attempts = 5;
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                return action();
            }
            catch (Exception e) when (attempt < attempts && e is IOException or UnauthorizedAccessException)
            {
                _logger.LogDebug(e, "BlockPreview: state file busy, retrying ({Attempt}/{Attempts}).", attempt, attempts);
                Thread.Sleep(50 * attempt);
            }
        }
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

        lock (FileLock)
        {
            var enabledAliases = ReadState().ToList();
            model.Alias = contentType.Alias;
            enabledAliases.RemoveAll(x => x.Id == model.Id);
            enabledAliases.Add(model);
            WriteState(enabledAliases);
        }
    }
}
