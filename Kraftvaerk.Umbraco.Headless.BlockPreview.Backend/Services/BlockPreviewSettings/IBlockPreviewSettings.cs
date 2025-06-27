using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewSettings;
public interface IBlockPreviewSettings
{
    HeadlessBlockPreviewOptions Options(Guid? pageId, string? culture, string? resolvedDomain);
}

