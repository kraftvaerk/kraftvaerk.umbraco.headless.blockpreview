using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models
{
    public class BlockPreviewFrontendModel
    {
        public string? Id { get; set; }
        public string? ContentType { get; set; }
        public string? SettingsType { get; set; }

        // These can be changed to more specific types if needed.
        public string? Content { get; set; }
        public string? Settings { get; set; }

        public string? Culture { get; set; }
    }

}

