using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Models.PublishedContent;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services;

public class ContextCultureService
{
    private readonly IVariationContextAccessor _variationContextAccessor;

    /// <summary>
    /// Initializes a new instance of the <see cref="ContextCultureService"/> class.
    /// </summary>
    /// <param name="variationContextAccessor">The variation context accessor.</param>
    public ContextCultureService(IVariationContextAccessor variationContextAccessor)
    {
        _variationContextAccessor = variationContextAccessor;
    }

    /// <summary>
    /// Sets the current culture.
    /// </summary>
    /// <param name="culture">The culture to set.</param>
    public void SetCulture(string culture)
    {
        _variationContextAccessor.VariationContext = new VariationContext(culture);

        var cultureInfo = new CultureInfo(culture);
        Thread.CurrentThread.CurrentCulture = cultureInfo;
        Thread.CurrentThread.CurrentUICulture = cultureInfo;
    }
}