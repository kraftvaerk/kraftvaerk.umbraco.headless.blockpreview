using Microsoft.Extensions.DependencyInjection;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Options;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockHelper;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewCache;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.BlockPreviewSettings;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.ContextCulture;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.DomainResolver;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.MvcRenderer;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.PreviewDB;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.PreviewStylesheets;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.RequestHelper;
using Umbraco.Cms.Core.Composing;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.PackageConstants;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Composers
{
    public class ServiceComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.AddTransient<IBlockHelper, BlockHelper>();
            builder.Services.AddTransient<IRequestHelper, RequestHelper>();
            builder.Services.AddTransient<IPreviewDB, PreviewDB>();
            builder.Services.AddTransient<IMvcBlockRenderer, MvcBlockRenderer>();
            builder.Services.AddSingleton<IBlockPreviewCache, BlockPreviewCache>();
            builder.Services.AddSingleton<IPreviewStylesheetService, PreviewStylesheetService>();

            // The per-request timeout is enforced with a CancellationToken in RequestHelper, so the client itself never times out first.
            builder.Services.AddHttpClient(BlockPreviewConstants.HttpClientName, client =>
            {
                client.Timeout = Timeout.InfiniteTimeSpan;
            });

            builder.Services.Configure<HeadlessBlockPreviewOptions>(
                builder.Config.GetSection(HeadlessBlockPreviewOptions.SectionName));

            builder.Services.AddTransient<IBlockPreviewSettings, BlockPreviewSettings>();
            builder.Services.AddScoped<IContextCultureService, ContextCultureService>();
            builder.Services.AddTransient<IPreviewDomainResolver, PreviewDomainResolver>();
        }
    }
}
