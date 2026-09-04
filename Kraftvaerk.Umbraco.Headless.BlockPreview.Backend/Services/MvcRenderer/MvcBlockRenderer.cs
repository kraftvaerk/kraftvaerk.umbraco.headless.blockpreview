using System.Reflection;
using System.Text.RegularExpressions;
using Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models.Blocks;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Web;
using Umbraco.Cms.Web.Common;
using Umbraco.Extensions;

namespace Kraftvaerk.Umbraco.Headless.BlockPreview.Backend.Services.MvcRenderer;

/// <summary>
/// Renders a block the same way Umbraco's own <c>PartialViewBlockEngine</c> does, but with a configurable view folder,
/// the block item type matching the hosting editor, and the Umbraco context primed with the page being edited.
/// </summary>
public class MvcBlockRenderer : IMvcBlockRenderer
{
    /// <summary>ViewData key views can check to know they are rendering inside the backoffice preview.</summary>
    public const string ViewDataBlockPreview = "BlockPreview";

    /// <summary>ViewData key holding the key of the document being edited (or <see cref="Guid.Empty"/>).</summary>
    public const string ViewDataAssignedId = "AssignedId";

    /// <summary>ViewData key holding the culture being edited, if any.</summary>
    public const string ViewDataCulture = "BlockPreviewCulture";

    /// <summary>ViewData key holding "grid", "list" or "richtext".</summary>
    public const string ViewDataEditor = "BlockPreviewEditor";

    private static readonly Regex AnchorTagRegex = new(@"<(?:a|area)\b[^>]*>", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly Regex HrefAttributeRegex = new(@"\s(?:xlink:)?href\s*=\s*(?:""[^""]*""|'[^']*'|[^\s>]+)", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private const string DisabledHref = " href=\"javascript:void(0)\" tabindex=\"-1\" aria-disabled=\"true\" style=\"pointer-events:none;cursor:default;\" data-blockpreview-link-disabled=\"\"";

    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IModelMetadataProvider _modelMetadataProvider;
    private readonly ITempDataDictionaryFactory _tempDataDictionaryFactory;
    private readonly IRazorViewEngine _razorViewEngine;
    private readonly IPublishedModelFactory _publishedModelFactory;
    private readonly IUmbracoContextAccessor _umbracoContextAccessor;
    private readonly IUmbracoHelperAccessor _umbracoHelperAccessor;
    private readonly IPublishedRouter _publishedRouter;
    private readonly IPublishedUrlProvider _publishedUrlProvider;
    private readonly ILogger<MvcBlockRenderer> _logger;

    public MvcBlockRenderer(
        IHttpContextAccessor httpContextAccessor,
        IModelMetadataProvider modelMetadataProvider,
        ITempDataDictionaryFactory tempDataDictionaryFactory,
        IRazorViewEngine razorViewEngine,
        IPublishedModelFactory publishedModelFactory,
        IUmbracoContextAccessor umbracoContextAccessor,
        IUmbracoHelperAccessor umbracoHelperAccessor,
        IPublishedRouter publishedRouter,
        IPublishedUrlProvider publishedUrlProvider,
        ILogger<MvcBlockRenderer> logger)
    {
        _httpContextAccessor = httpContextAccessor;
        _modelMetadataProvider = modelMetadataProvider;
        _tempDataDictionaryFactory = tempDataDictionaryFactory;
        _razorViewEngine = razorViewEngine;
        _publishedModelFactory = publishedModelFactory;
        _umbracoContextAccessor = umbracoContextAccessor;
        _umbracoHelperAccessor = umbracoHelperAccessor;
        _publishedRouter = publishedRouter;
        _publishedUrlProvider = publishedUrlProvider;
        _logger = logger;
    }

    public async Task<string> RenderAsync(MvcBlockRenderRequest request)
    {
        var httpContext = _httpContextAccessor.HttpContext
            ?? throw new BlockPreviewException("No HttpContext is available to render the block in.");

        var alias = request.Content.ContentType.Alias;

        // Strongly typed ModelsBuilder models when they exist, otherwise the raw element.
        var content = ToModel(request.Content);
        var settings = request.Settings == null ? null : ToModel(request.Settings);

        var blockItem = CreateBlockItem(request, content, settings);

        var folder = request.Editor switch
        {
            BlockEditorKind.List => request.Options.BlockListViewsPath,
            BlockEditorKind.RichText => request.Options.RichTextViewsPath,
            _ => request.Options.BlockGridViewsPath,
        };

        var (view, searched) = FindView(folder, alias);
        if (view == null)
        {
            throw new BlockPreviewException(
                $"No partial view found for block '{alias}' ({request.Editor}). Looked for: {string.Join(", ", searched)}", 404);
        }

        await PrepareUmbracoContextAsync(request, httpContext);

        var viewData = new ViewDataDictionary(_modelMetadataProvider, new ModelStateDictionary())
        {
            Model = blockItem,
        };
        viewData[ViewDataBlockPreview] = true;
        viewData[ViewDataAssignedId] = request.PageKey ?? Guid.Empty;
        viewData[ViewDataCulture] = request.Culture;
        viewData[ViewDataEditor] = request.Editor switch
        {
            BlockEditorKind.List => "list",
            BlockEditorKind.RichText => "richtext",
            _ => "grid",
        };

        var actionContext = new ActionContext(httpContext, httpContext.GetRouteData(), new ControllerActionDescriptor());

        await using var writer = new StringWriter();
        var viewContext = new ViewContext(
            actionContext,
            view,
            viewData,
            _tempDataDictionaryFactory.GetTempData(httpContext),
            writer,
            new HtmlHelperOptions());

        try
        {
            await view.RenderAsync(viewContext);
        }
        catch (Exception e)
        {
            throw new BlockPreviewException($"View '{view.Path}' threw while rendering block '{alias}': {Unwrap(e).Message}", 500, e);
        }

        var html = writer.ToString();
        return request.Options.DisableLinks ? DisableLinks(html) : html;
    }

    private IPublishedElement ToModel(IPublishedElement element)
    {
        try
        {
            return _publishedModelFactory.CreateModel(element) as IPublishedElement ?? element;
        }
        catch (Exception e)
        {
            throw new BlockPreviewException(
                $"Could not create a strongly typed model for '{element.ContentType.Alias}': {Unwrap(e).Message}", 500, e);
        }
    }

    private static object CreateBlockItem(MvcBlockRenderRequest request, IPublishedElement content, IPublishedElement? settings)
    {
        var hasSettings = settings != null;
        Type openType = (request.Editor, hasSettings) switch
        {
            (BlockEditorKind.List, true) => typeof(BlockListItem<,>),
            (BlockEditorKind.List, false) => typeof(BlockListItem<>),
            (BlockEditorKind.RichText, true) => typeof(RichTextBlockItem<,>),
            (BlockEditorKind.RichText, false) => typeof(RichTextBlockItem<>),
            (_, true) => typeof(BlockGridItem<,>),
            (_, false) => typeof(BlockGridItem<>),
        };

        var closedType = hasSettings
            ? openType.MakeGenericType(content.GetType(), settings!.GetType())
            : openType.MakeGenericType(content.GetType());

        // Umbraco 15+ has (Guid contentKey, TContent content, Guid? settingsKey, TSettings settings); older versions used Udi.
        var ctors = closedType.GetConstructors(BindingFlags.Public | BindingFlags.Instance);
        var guidCtor = ctors.FirstOrDefault(c => c.GetParameters() is { Length: 4 } p && p[0].ParameterType == typeof(Guid));
        var udiCtor = ctors.FirstOrDefault(c => c.GetParameters() is { Length: 4 } p && p[0].ParameterType == typeof(Udi));

        object item;
        if (guidCtor != null)
        {
            item = guidCtor.Invoke([content.Key, content, hasSettings ? settings!.Key : null, settings]);
        }
        else if (udiCtor != null)
        {
            item = udiCtor.Invoke(
            [
                Udi.Create(Constants.UdiEntityType.Element, content.Key),
                content,
                hasSettings ? Udi.Create(Constants.UdiEntityType.Element, settings!.Key) : null,
                settings,
            ]);
        }
        else
        {
            throw new BlockPreviewException($"No usable constructor found on {closedType.FullName}.");
        }

        if (item is BlockGridItem gridItem)
        {
            gridItem.ColumnSpan = request.ColumnSpan is > 0 ? request.ColumnSpan.Value : 12;
            gridItem.RowSpan = request.RowSpan is > 0 ? request.RowSpan.Value : 1;
            gridItem.GridColumns ??= 12;
        }

        return item;
    }

    private (IView? view, List<string> searched) FindView(string folder, string alias)
    {
        var normalized = NormalizeFolder(folder);
        var searched = new List<string>();

        foreach (var candidate in ViewNameCandidates(alias))
        {
            var path = $"{normalized}/{candidate}.cshtml";
            searched.Add(path);
            var result = _razorViewEngine.GetView(null, path, isMainPage: false);
            if (result.Success)
                return (result.View, searched);
        }

        return (null, searched);
    }

    private static IEnumerable<string> ViewNameCandidates(string alias)
    {
        yield return alias;
        if (alias.Length > 0 && char.IsLower(alias[0]))
            yield return char.ToUpperInvariant(alias[0]) + alias[1..];
    }

    private static string NormalizeFolder(string folder)
    {
        var f = (folder ?? string.Empty).Trim().Replace('\\', '/').TrimEnd('/');
        if (f.Length == 0) f = "~/Views/Partials/blockgrid/Components";
        if (f.StartsWith("~/")) return f;
        if (f.StartsWith('/')) return "~" + f;
        return "~/" + f;
    }

    /// <summary>
    /// Makes the render look like a request for the page being edited so views can use
    /// <c>Umbraco.AssignedContentItem</c>, <c>UmbracoContext.PublishedRequest</c> and culture-variant values.
    /// </summary>
    private async Task PrepareUmbracoContextAsync(MvcBlockRenderRequest request, HttpContext httpContext)
    {
        // The variation context (culture) is set by IContextCultureService before rendering starts.
        if (request.PageKey is not { } pageKey || pageKey == Guid.Empty)
            return;

        if (!_umbracoContextAccessor.TryGetUmbracoContext(out var umbracoContext))
            return;

        IPublishedContent? page;
        try
        {
            page = umbracoContext.Content?.GetById(true, pageKey);
        }
        catch (Exception e)
        {
            _logger.LogDebug(e, "BlockPreview: could not load page {PageKey} for the preview context.", pageKey);
            return;
        }

        if (page == null)
            return;

        try
        {
            if (umbracoContext.PublishedRequest?.PublishedContent?.Key != pageKey)
            {
                var builder = await _publishedRouter.CreateRequestAsync(ResolvePageUri(page, request.Culture, httpContext));
                builder.SetPublishedContent(page);
                if (!string.IsNullOrWhiteSpace(request.Culture))
                    builder.SetCulture(request.Culture);
                umbracoContext.PublishedRequest = builder.Build();
            }
        }
        catch (Exception e)
        {
            _logger.LogDebug(e, "BlockPreview: could not create a published request for page {PageKey}.", pageKey);
        }

        if (_umbracoHelperAccessor.TryGetUmbracoHelper(out var umbracoHelper) && umbracoHelper != null)
            umbracoHelper.AssignedContentItem = page;
    }

    private Uri ResolvePageUri(IPublishedContent page, string? culture, HttpContext httpContext)
    {
        try
        {
            var url = _publishedUrlProvider.GetUrl(page, UrlMode.Absolute, culture);
            if (Uri.TryCreate(url, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
                return uri;
        }
        catch
        {
            // unroutable page, fall through
        }

        return new Uri($"{httpContext.Request.Scheme}://{httpContext.Request.Host}/");
    }

    /// <summary>
    /// Neutralises href attributes on anchors so a click inside the preview never navigates the backoffice away.
    /// </summary>
    public static string DisableLinks(string html)
    {
        if (string.IsNullOrEmpty(html)) return html;
        return AnchorTagRegex.Replace(html, m => HrefAttributeRegex.Replace(m.Value, DisabledHref));
    }

    private static Exception Unwrap(Exception e)
    {
        while (e is TargetInvocationException { InnerException: { } inner })
            e = inner;
        return e;
    }
}
