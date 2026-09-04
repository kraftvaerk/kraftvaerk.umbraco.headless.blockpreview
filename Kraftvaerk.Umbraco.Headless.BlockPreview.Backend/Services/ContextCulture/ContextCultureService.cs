using System.Globalization;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.ContextCulture;

/// <summary>
/// Originally contributed by Mark Brunner (zynex-mbrunner) and Mads Mørch Schou for multilanguage sites (#4, #5, #6).
/// </summary>
public sealed class ContextCultureService : IContextCultureService
{
    private readonly IVariationContextAccessor _variationContextAccessor;
    private readonly ILogger<ContextCultureService> _logger;

    public ContextCultureService(IVariationContextAccessor variationContextAccessor, ILogger<ContextCultureService> logger)
    {
        _variationContextAccessor = variationContextAccessor;
        _logger = logger;
    }

    public void SetCulture(string? culture)
    {
        if (string.IsNullOrWhiteSpace(culture))
            return;

        CultureInfo cultureInfo;
        try
        {
            // predefinedOnly: ICU happily invents a culture for any well-formed name, which is not what we want here.
            cultureInfo = CultureInfo.GetCultureInfo(culture, predefinedOnly: true);
        }
        catch (CultureNotFoundException e)
        {
            _logger.LogDebug(e, "BlockPreview: '{Culture}' is not a known culture; rendering in the default culture.", culture);
            return;
        }

        _variationContextAccessor.VariationContext = new VariationContext(culture);
        CultureInfo.CurrentCulture = cultureInfo;
        CultureInfo.CurrentUICulture = cultureInfo;
    }
}
