using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Models;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.PreviewDB;
public interface IPreviewDB
{
    HeadlessPreviewToggleModel Get(Guid blockId);

    List<HeadlessPreviewToggleModel> GetEnabled();

    void Set(HeadlessPreviewToggleModel model);
}

