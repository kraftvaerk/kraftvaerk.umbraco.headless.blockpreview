using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.MvcRenderer;
using Xunit;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Tests;

public class LinkDisablingTests
{
    [Fact]
    public void Anchor_hrefs_are_neutralised()
    {
        var html = "<a class=\"x\" href=\"/page\">go</a><A HREF='/other' target=_blank>two</A>";

        var result = MvcBlockRenderer.DisableLinks(html);

        Assert.DoesNotContain("/page", result);
        Assert.DoesNotContain("/other", result);
        Assert.Equal(2, CountOf(result, "javascript:void(0)"));
        Assert.Contains("class=\"x\"", result);
        Assert.Contains("target=_blank", result);
    }

    [Fact]
    public void Svg_xlink_hrefs_and_area_tags_are_covered()
    {
        var html = "<svg><a xlink:href=\"/svg-link\"><text>t</text></a></svg><map><area href=\"/area-target\" shape=rect></map>";

        var result = MvcBlockRenderer.DisableLinks(html);

        Assert.DoesNotContain("/svg-link", result);
        Assert.DoesNotContain("/area-target", result);
    }

    [Fact]
    public void Link_tags_images_and_scripts_keep_their_urls()
    {
        var html = "<link rel=\"stylesheet\" href=\"/css/site.css\"><img src=\"/a.png\"><script src=\"/b.js\"></script><a href=\"/x\">x</a>";

        var result = MvcBlockRenderer.DisableLinks(html);

        Assert.Contains("href=\"/css/site.css\"", result);
        Assert.Contains("src=\"/a.png\"", result);
        Assert.Contains("src=\"/b.js\"", result);
        Assert.DoesNotContain("href=\"/x\"", result);
    }

    [Theory]
    [InlineData("")]
    [InlineData("<p>no links</p>")]
    public void Html_without_anchors_is_returned_unchanged(string html)
    {
        Assert.Equal(html, MvcBlockRenderer.DisableLinks(html));
    }

    private static int CountOf(string haystack, string needle) =>
        (haystack.Length - haystack.Replace(needle, string.Empty).Length) / needle.Length;
}
