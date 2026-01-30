using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Cms.Core.Models.DeliveryApi;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models
{
    public class BlockPreviewBackendModel
    {
        public required IApiElement Content { get; set; }

        public IApiElement? Settings { get; set; }

        public Dictionary<string, object?> RawContent { get; set; } = new Dictionary<string, object?>();
        public Dictionary<string, object?> RawSettings { get; set; } = new Dictionary<string, object?>();

        public Guid Key { get; set; }
    }
}

