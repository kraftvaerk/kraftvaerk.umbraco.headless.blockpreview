using Microsoft.Extensions.DependencyInjection;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewSettings;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.PreviewDB;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.RequestHelper;
using Umbraco.Cms.Core.Composing;
using Kraftvaerk.Umbraco.Headless.Blockpreview.Backend.Services.PreviewDB;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Composers
{
    public class ServiceComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            // example of registering a service
            builder.Services.AddTransient<IBlockHelper, BlockHelper>();
            builder.Services.AddTransient<IRequestHelper, RequestHelper>();
            builder.Services.AddTransient<IPreviewDB, PreviewDB>();

            builder.Services.Configure<HeadlessBlockPreviewOptions>(
                builder.Config.GetSection(HeadlessBlockPreviewOptions.SectionName));

            builder.Services.AddTransient<IBlockPreviewSettings, BlockPreviewSettings>();

        }
    }
}

