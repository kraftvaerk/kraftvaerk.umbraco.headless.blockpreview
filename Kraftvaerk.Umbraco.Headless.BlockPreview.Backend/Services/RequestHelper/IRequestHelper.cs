using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.RequestHelper;
public interface IRequestHelper
{
    Task<string?> Post(BlockPreviewBackendModel model, HeadlessBlockPreviewOptions previewOptions);

    string? TrimByCssSelector(string html, string selector);
}

