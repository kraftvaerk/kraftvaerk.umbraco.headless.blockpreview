using System.Globalization;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services;

public sealed class ContextCultureService(IVariationContextAccessor variationContextAccessor)
{

  /// <summery>
  /// Sets the current culture.
  /// </summery>
  /// <param name="culture">The culture to set.</param>
  public void setCulture(string culture)
    {
        variationContextAccessor.VariationContext = new VariationContext(culture);
        var cultureInfo = new CultureInfo(culture);
        Thread.CurrentThread.CurrentCulture = cultureInfo;
        Thread.CurrentThread.CurrentUICulture = cultureInfo;
    }
}
