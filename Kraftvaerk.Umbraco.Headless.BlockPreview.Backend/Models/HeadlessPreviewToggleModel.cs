using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;
public class HeadlessPreviewToggleModel
{
    public Guid Id { get; set; }
    public bool Enabled { get; set; }
    public bool EnabledNested { get; set; }
    public bool EnabledList { get; set; }
    public bool EnabledGrid { get; set; }
    public bool EnabledRTE { get; set; }
    public string? AdvancedSettings { get; set; }

    public string? Alias { get; set; }
}

