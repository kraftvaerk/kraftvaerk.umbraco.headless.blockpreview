using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.PreviewStylesheets;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Tests;

public class PreviewStylesheetServiceTests : IDisposable
{
    private readonly string _wwwroot = Path.Combine(Path.GetTempPath(), "blockpreview-tests", Guid.NewGuid().ToString("N"));

    public PreviewStylesheetServiceTests()
    {
        Directory.CreateDirectory(_wwwroot);
    }

    public void Dispose()
    {
        try { Directory.Delete(_wwwroot, true); } catch { /* best effort */ }
    }

    private PreviewStylesheetService Create(params string[] stylesheets)
    {
        var env = new Mock<IWebHostEnvironment>();
        env.SetupGet(x => x.WebRootPath).Returns(_wwwroot);
        env.SetupGet(x => x.WebRootFileProvider).Returns(new PhysicalFileProvider(_wwwroot));

        return new PreviewStylesheetService(
            env.Object,
            new MemoryCache(new MemoryCacheOptions()),
            Options.Create(new HeadlessBlockPreviewOptions { Stylesheets = stylesheets }),
            NullLogger<PreviewStylesheetService>.Instance);
    }

    [Fact]
    public void Root_variables_are_inlined_and_page_selectors_rewritten()
    {
        var css = """
            /* comment mentioning body */
            :root { --brand: #006eff; --text: var(--brand); --gap: 16px; }
            html, body { margin: 0; }
            body.dark { background: #111; }
            .card { color: var(--text); padding: var(--gap); border: 1px solid var(--missing, #ccc); }
            @media (min-width: 600px) { body { font-size: 18px; } }
            .body-copy { content: "body"; background: url(/img/body.html); }
            """;

        var result = Create().Transform(css);

        Assert.Contains(".__block-preview { --brand: #006eff; --text: #006eff; --gap: 16px; }", result);
        Assert.Contains(".__block-preview, .__block-preview { margin: 0; }", result);
        Assert.Contains(".__block-preview.dark", result);
        Assert.Contains("color: #006eff; padding: 16px; border: 1px solid #ccc;", result);
        Assert.Contains("@media (min-width: 600px) { .__block-preview { font-size: 18px; } }", result);
        Assert.Contains(".body-copy { content: \"body\"; background: url(/img/body.html); }", result);
        Assert.DoesNotContain("comment", result);
    }

    [Fact]
    public void Unresolvable_var_without_fallback_is_left_as_is()
    {
        var result = Create().Transform(":root { --a: 1px; } .x { width: var(--nope); }");

        Assert.Contains("width: var(--nope);", result);
    }

    [Fact]
    public void No_stylesheets_configured_returns_null()
    {
        Assert.Null(Create().GetResolvedCss());
    }

    [Fact]
    public void Only_css_files_inside_wwwroot_are_served()
    {
        File.WriteAllText(Path.Combine(_wwwroot, "site.css"), ":root { --c: red; } body { color: var(--c); }");
        File.WriteAllText(Path.Combine(_wwwroot, "secret.txt"), "nope");

        var result = Create("/site.css", "secret.txt", "../outside.css", "/missing.css")!.GetResolvedCss();

        Assert.NotNull(result);
        Assert.Contains("/* /site.css */", result);
        Assert.Contains(".__block-preview { color: red; }", result);
        Assert.DoesNotContain("nope", result);
    }

    [Fact]
    public void Stylesheet_paths_without_leading_slash_are_accepted()
    {
        Directory.CreateDirectory(Path.Combine(_wwwroot, "css"));
        File.WriteAllText(Path.Combine(_wwwroot, "css", "a.css"), ".a{}");

        Assert.Contains(".a{}", Create("css/a.css").GetResolvedCss());
    }
}
