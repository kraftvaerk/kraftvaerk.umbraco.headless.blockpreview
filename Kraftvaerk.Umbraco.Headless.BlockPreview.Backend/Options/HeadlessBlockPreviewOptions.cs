using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;
public class HeadlessBlockPreviewOptions
{
    public const string SectionName = "HeadlessBlockPreview";

    public string Host { get; set; } = string.Empty;
    public string Api { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string Selector { get; set; } = string.Empty;
    public string Template { get; set; } = string.Empty;

    public bool Debug { get; set; }
}

