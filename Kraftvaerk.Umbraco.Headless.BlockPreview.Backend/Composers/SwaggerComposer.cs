using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Kraftvaerk.Umbraco.Headless.Blockpreview.Backend.PackageConstants;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Api.Management.OpenApi;
using Umbraco.Cms.Core.Composing;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Composers;
public class SwaggerComposer : IComposer
{

    public class MyBackOfficeSecurityRequirementsOperationFilter : BackOfficeSecurityRequirementsOperationFilterBase
    {
        protected override string ApiName => $"{BlockPreviewConstants.PackageName}-api-v1";
    }

    public class MyConfigureSwaggerGenOptions : IConfigureOptions<SwaggerGenOptions>
    {
        public void Configure(SwaggerGenOptions options)
        {
            options.SwaggerDoc($"{BlockPreviewConstants.PackageName}-api-v1", new OpenApiInfo { Title = "Headless Block Preview v1", Version = "1.0" });
            options.OperationFilter<MyBackOfficeSecurityRequirementsOperationFilter>();
        }
    }
    public void Compose(IUmbracoBuilder builder)
    {
       // builder.Services.ConfigureOptions<MyConfigureSwaggerGenOptions>();
    }
}
