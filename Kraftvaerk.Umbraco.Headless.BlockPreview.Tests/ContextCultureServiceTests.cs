using System.Globalization;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.ContextCulture;
using Microsoft.Extensions.Logging.Abstractions;
using Umbraco.Cms.Core.Models.PublishedContent;
using Xunit;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Tests;

public class ContextCultureServiceTests
{
    private sealed class Accessor : IVariationContextAccessor
    {
        public VariationContext? VariationContext { get; set; }
    }

    [Fact]
    public void Valid_culture_sets_variation_and_thread_culture()
    {
        var accessor = new Accessor();
        var original = CultureInfo.CurrentCulture;
        try
        {
            new ContextCultureService(accessor, NullLogger<ContextCultureService>.Instance).SetCulture("da-DK");

            Assert.Equal("da-DK", accessor.VariationContext!.Culture);
            Assert.Equal("da-DK", CultureInfo.CurrentCulture.Name);
            Assert.Equal("da-DK", CultureInfo.CurrentUICulture.Name);
        }
        finally
        {
            CultureInfo.CurrentCulture = original;
            CultureInfo.CurrentUICulture = original;
        }
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("  ")]
    [InlineData("not-a-culture-at-all-xx")]
    public void Missing_or_unknown_culture_leaves_the_context_alone(string? culture)
    {
        var accessor = new Accessor();

        new ContextCultureService(accessor, NullLogger<ContextCultureService>.Instance).SetCulture(culture);

        Assert.Null(accessor.VariationContext);
    }
}
