using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewSettings;
public class BlockPreviewSettings : IBlockPreviewSettings
{
    private readonly HeadlessBlockPreviewOptions _headlessBlockPreviewOptions;
    public BlockPreviewSettings(IOptions<HeadlessBlockPreviewOptions> options)
    {
        _headlessBlockPreviewOptions = options.Value;
    }
    public HeadlessBlockPreviewOptions Options(Guid? pageId, string? culture, string? resolvedDomain)
    {
        // just return options - this is a service to other developers to be able to take control of how options are set up. 
        // they might want to be able to react to multi-site or language variations
        // (ie. sitea.com should preview from one frontend and siteb.com should preview from another)
        // or certain languages should load a different style-sheet. Basicially, anything they want to react on, they can here, instead of using appsettings.

        return _headlessBlockPreviewOptions;
    }
}

