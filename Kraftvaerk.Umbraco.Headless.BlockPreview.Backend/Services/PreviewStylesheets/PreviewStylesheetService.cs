using System.Text;
using System.Text.RegularExpressions;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.PackageConstants;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.PreviewStylesheets;

public class PreviewStylesheetService : IPreviewStylesheetService
{
    private const string CacheKey = "BlockPreview_ResolvedCss";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(24);

    private static readonly Regex CommentRegex = new(@"/\*.*?\*/", RegexOptions.Singleline | RegexOptions.Compiled);
    private static readonly Regex RootBlockRegex = new(@"(?<=^|[{};])\s*([^{};@]*?:root[^{}]*)\{([^{}]*)\}", RegexOptions.Compiled);
    private static readonly Regex VariableDeclRegex = new(@"(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);?", RegexOptions.Compiled);
    private static readonly Regex VarUsageRegex = new(@"var\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^()]*(?:\([^()]*\)[^()]*)*))?\)", RegexOptions.Compiled);
    private static readonly Regex SelectorRegex = new(@"(?<=^|[{};])([^{};@][^{};]*?)(?=\{)", RegexOptions.Compiled);
    private static readonly Regex HtmlBodyRootRegex = new(@"(?<![\w.#\[-])(?:html|body|:root)(?![\w-])", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private readonly IWebHostEnvironment _env;
    private readonly IMemoryCache _cache;
    private readonly IOptions<HeadlessBlockPreviewOptions> _options;
    private readonly ILogger<PreviewStylesheetService> _logger;

    public PreviewStylesheetService(
        IWebHostEnvironment env,
        IMemoryCache cache,
        IOptions<HeadlessBlockPreviewOptions> options,
        ILogger<PreviewStylesheetService> logger)
    {
        _env = env;
        _cache = cache;
        _options = options;
        _logger = logger;
    }

    public string? GetResolvedCss()
    {
        var stylesheets = _options.Value.Stylesheets ?? [];
        if (stylesheets.Length == 0)
            return null;

        return _cache.GetOrCreate(CacheKey, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheDuration;

            var sb = new StringBuilder();
            foreach (var stylesheet in stylesheets)
            {
                var path = (stylesheet ?? string.Empty).Trim().Replace('\\', '/').TrimStart('~');
                if (path.Length == 0) continue;
                if (!path.StartsWith('/')) path = "/" + path;

                if (path.Contains("..") || !path.EndsWith(".css", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogWarning("BlockPreview: stylesheet '{Path}' ignored. Only .css files inside wwwroot can be served.", stylesheet);
                    continue;
                }

                var fileInfo = _env.WebRootFileProvider.GetFileInfo(path);
                if (!fileInfo.Exists || fileInfo.IsDirectory)
                {
                    _logger.LogWarning("BlockPreview: stylesheet '{Path}' was not found in wwwroot.", path);
                    continue;
                }

                // Edits to the file invalidate the cache.
                entry.AddExpirationToken(_env.WebRootFileProvider.Watch(path));

                try
                {
                    using var stream = fileInfo.CreateReadStream();
                    using var reader = new StreamReader(stream, Encoding.UTF8);
                    sb.AppendLine($"/* {path} */");
                    sb.AppendLine(Transform(reader.ReadToEnd()));
                }
                catch (Exception e)
                {
                    _logger.LogWarning(e, "BlockPreview: stylesheet '{Path}' could not be read.", path);
                }
            }

            return sb.Length == 0 ? null : sb.ToString();
        });
    }

    public string Transform(string css)
    {
        if (string.IsNullOrWhiteSpace(css)) return string.Empty;

        css = CommentRegex.Replace(css, string.Empty);

        // 1. Inline custom properties declared on :root. Inside a shadow root ":root" matches nothing, so var() lookups would fail.
        var variables = ExtractRootVariables(css);
        if (variables.Count > 0)
        {
            // Two passes so var() used inside another variable's value resolves as well.
            for (var i = 0; i < 2; i++)
            {
                css = VarUsageRegex.Replace(css, m =>
                {
                    var name = m.Groups[1].Value;
                    if (variables.TryGetValue(name, out var value)) return value;
                    return m.Groups[2].Success ? m.Groups[2].Value.Trim() : m.Value;
                });
            }
        }

        // 2. Rewrite html / body / :root selectors so page-level styles apply to the preview wrapper.
        var replacement = "." + BlockPreviewConstants.PreviewRootClass;
        css = SelectorRegex.Replace(css, m => HtmlBodyRootRegex.Replace(m.Value, replacement));

        return css;
    }

    private static Dictionary<string, string> ExtractRootVariables(string css)
    {
        var variables = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        foreach (Match block in RootBlockRegex.Matches(css))
        {
            foreach (Match decl in VariableDeclRegex.Matches(block.Groups[2].Value))
                variables[decl.Groups[1].Value.Trim()] = decl.Groups[2].Value.Trim();
        }

        // Resolve variables referring to other variables.
        foreach (var key in variables.Keys.ToList())
        {
            variables[key] = VarUsageRegex.Replace(variables[key], m =>
                variables.TryGetValue(m.Groups[1].Value, out var v) ? v : (m.Groups[2].Success ? m.Groups[2].Value.Trim() : m.Value));
        }

        return variables;
    }
}
