# Kraftvaerk.Umbraco.Headless.BlockPreview

Live preview of your blocks, right inside the backoffice - powered by your frontend.

⚡ **Requires Umbraco 17.5 or newer** (includes all 18.x releases)  
🧩 **Supports Block List, Block Grid, and blocks inside RTE**  
🧠 **Headless and frontend-agnostic** — bring your own HTML  
🧱 **Or not headless at all** — set `UseMVC: true` and blocks render through your own Razor partial views, no frontend needed  
🌍 **Multi-site and culture-aware** — override settings per domain or language  
💾 **Persists preview state to `blockPreview/state.json`** — commit and deploy like any other config

## What it does

Headless.BlockPreview lets content editors preview individual blocks **inline** while editing, using real HTML from your headless frontend.

This is not Umbraco's page preview — it's a live preview of each block right inside the editing UI.

When enabled:
- Editing a block (in a Block List, Block Grid, or RTE) triggers a `POST` to your frontend.
- The request contains a model with `Content` and `Settings` (as `IApiElement`), just like the Delivery API.
- Your frontend returns rendered HTML for that block.
- That HTML is injected directly into the backoffice UI.

How you render that HTML is entirely up to you — use Vue, React, Razor, or `document.write`.  
✨ *It's your problem*

## Quickstart

### 1. Install the NuGet package

```bash
dotnet add package Kraftvaerk.Umbraco.Headless.BlockPreview
```

After the first startup, the package registers an appsettings schema, so you'll get IntelliSense support for its config.


### 2. Configure appsettings.json

```json
"HeadlessBlockPreview": {
  "Host": "http://localhost:3001",
  "Api": "/__blockpreview",
  "ApiKey": "woot",
  "Selector": "#__preview",
  "Template": "<link rel=\"stylesheet\" href=\"/cms.css\" /><style>.__block-preview { background: black; }</style><div class=\"__block-preview\">{{html}}</div>",
  "EnableOutputCaching": false,
  "Debug": false
}
```

### Configuration explained

- **Host**:  
  The base URL of your frontend app. This is where preview requests will be sent.

- **Api**:  
  The relative path that the preview POST request is sent to — combined with `Host`.

- **ApiKey**:  
  A shared secret included in the request header `kuhb-header`. Optional, but useful for securing your preview endpoint.

- **Selector**:  
  A CSS selector used to extract a portion of the returned HTML. For example, if your frontend returns a full HTML document, you can use `"#app"` or `"#__preview"` to isolate just the part you want shown in the backoffice.

- **Template**:  
  An HTML string that wraps the returned preview HTML. The placeholder `{{html}}` will be replaced with the content extracted by `Selector`. This is your chance to include custom stylesheets, fonts, or any other dependencies your preview needs.

- **EnableOutputCaching**:  
  When set to `true`, preview responses are cached in memory based on the block content. Identical requests within 24 hours return cached HTML instantly, avoiding repeated calls to your frontend. This can significantly improve performance for frequently edited blocks, but may increase RAM usage.

- **TimeoutSeconds** (default `30`):  
  How long to wait for your frontend before the preview fails with a clear timeout message.

- **MaxConcurrentPreviews** (default `6`):  
  How many preview requests a backoffice tab keeps in flight at once. A page with 40 blocks no longer fires 40 simultaneous renders; the rest wait in a queue, and a block that is edited again while waiting is skipped.

- **Debug**:  
  When set to `true`, every preview request and response is logged as a warning using Umbraco's logging — useful for troubleshooting. Failures are **always** logged (with page, culture, content type, target, elapsed time and a correlation id that is also shown to the editor), regardless of this flag.

- **UseMVC**, **BlockGridViewsPath**, **BlockListViewsPath**, **RichTextViewsPath**, **DisableLinks**, **Stylesheets**:  
  See [Razor / MVC mode](#razor--mvc-mode) below.

### Razor / MVC mode

Not headless? You don't need a frontend at all. Set `UseMVC` to `true` and the package renders each block **in-process** through the same partial views your site already uses:

```json
"HeadlessBlockPreview": {
  "UseMVC": true,
  "Stylesheets": [ "/css/site.css" ],
  "Template": "<link rel=\"stylesheet\" href=\"/api/v1/Kraftvaerk.Umbraco.Headless.Blockpreview/css\" /><div class=\"__block-preview\">{{html}}</div>",
  "Debug": false
}
```

`Host`, `Api` and `ApiKey` are ignored in this mode.

How a block is rendered:

- The block data from the editor is turned into an `IPublishedElement`, run through `IPublishedModelFactory` (so you get your ModelsBuilder models), and wrapped in the block item type that matches the editor it lives in: `BlockGridItem<T>`, `BlockListItem<T>` or `RichTextBlockItem<T>` (with `<TContent, TSettings>` when the block has settings).
- The partial view is looked up by content type alias in the folder for that editor. Defaults follow Umbraco's own convention and can be changed:

  | Setting | Default |
  |---|---|
  | `BlockGridViewsPath` | `~/Views/Partials/blockgrid/Components` |
  | `BlockListViewsPath` | `~/Views/Partials/blocklist/Components` |
  | `RichTextViewsPath` | `~/Views/Partials/richtext/Components` |

- The view renders as if it were part of the page being edited: `Umbraco.AssignedContentItem` and `UmbracoContext.PublishedRequest` point at that page (draft version), and the variation context is set to the culture being edited. For Block Grid, `Model.ColumnSpan` / `Model.RowSpan` reflect the editor layout.
- `ViewBag.BlockPreview` is `true`, `ViewBag.AssignedId` holds the page key, `ViewBag.BlockPreviewEditor` is `"grid"`, `"list"` or `"richtext"`, and `ViewBag.BlockPreviewCulture` the culture. Use these when a view needs to behave differently in the backoffice (skip a heavy API call, show a placeholder for a spacer, ...).
- With `DisableLinks` (default `true`), every `href` on an `<a>`/`<area>` in the output is neutralised so a click inside the preview never navigates the backoffice away.
- If no view is found or the view throws, the editor sees the reason under the block (and the log has the details).

**Stylesheets.** The backoffice renders previews inside a shadow DOM, where `:root` custom properties and `html`/`body` rules from your site CSS don't apply. List your stylesheets (relative to `wwwroot`) in `Stylesheets`, and reference `/api/v1/Kraftvaerk.Umbraco.Headless.Blockpreview/css` from the `Template`: the package serves them with `:root` variables inlined and `html`, `body` and `:root` selectors rewritten to `.__block-preview`. The result is cached and refreshed when a file changes. Only `.css` files inside `wwwroot` are served.

`Selector`, `Template`, `EnableOutputCaching`, `Debug` and `IBlockPreviewSettings` work exactly as in headless mode.

### 3. Run the bundled example preview server (recommended)

This repository includes a minimal Node-based preview target in `example-preview-frontend`.

Run it with:

```bash
cd example-preview-frontend
npm install
npm start
```

It listens on `http://localhost:3001` and exposes `POST /__blockpreview`.

The sample Umbraco project in `Umbraco/Umbraco-17.2.0` is preconfigured to use this target.

### 4. (Optional) Implement your own frontend preview endpoint

The package sends a `POST` request with the following payload:

```csharp
public class BlockPreviewBackendModel
{
    public IApiElement? Content { get; set; }
    public IApiElement? Settings { get; set; }
}
```

If your frontend uses Umbraco's Content Delivery API types, this should feel familiar — and easy to work with.

If you prefer your own target app, here's a minimal Express server that echoes the request body as HTML:

```js
const express = require('express');
const app = express();
app.use(express.json());

app.post('/__blockpreview', (req, res) => {
  res.send(`<pre>${JSON.stringify(req.body, null, 2)}</pre>`);
});

app.listen(3001, () => {
  console.log('Preview server running on http://localhost:3001');
});
```

This just dumps the raw request. For actual previews, you'll want to render real components using your frontend framework of choice.

## Persistent settings

BlockPreview adds an extra tab to the editing workspace for blocks in the Block List and Block Grid editors, allowing you to toggle preview mode for each block.

Whenever you enable preview for a block (in a Block List, Block Grid, or RTE), that preference is saved to a local file:

**blockPreview/state.json**

This file contains the list of blocks that should use preview mode and their configuration. You can commit this file to your Git repository to ensure consistent behavior across environments.

## Font loading

If your previewed blocks rely on custom fonts, you might notice that fonts don't load correctly in the backoffice preview, even if you have injected your css in the template.
This is because the backoffice runs your preview inside a deeply nested web-component and fonts don't load correctly in that context.

This plugin will attempt to load the file /wwwroot/App_Plugins/global/global.css and inject it into the backoffice

Example:
```css
/* Fira Sans - Local fonts */
@font-face {
    font-family: 'Fira Sans';
    font-style: normal;
    font-weight: 300;
    font-display: swap;
    src: url('/assets/fonts/FiraSans-Light.ttf') format('truetype');
}
... more font-faces ...
```

This would enable the fira sans font to be used in your block previews.

## Advanced: Per-site behavior

If you're working with a multi-site or multi-lingual setup, you might want different preview behavior depending on the request context — for example, sending requests to different frontend apps, applying different stylesheets, or customizing the HTML template.

To support this, you can implement your own `IBlockPreviewSettings`:

```csharp
public class BlockPreviewSettings : IBlockPreviewSettings
{
    private readonly HeadlessBlockPreviewOptions _default;

    public BlockPreviewSettings(IOptions<HeadlessBlockPreviewOptions> options)
    {
        _default = options.Value;
    }

    public HeadlessBlockPreviewOptions Options(Guid? pageId, string? culture, string? resolvedDomain)
    {
        // Customize logic based on page ID, culture, or domain
        return _default;
    }
}
```

Register this implementation in DI like any other Umbraco service. This gives you full control over:

- 🔀 Host and API URL per site  
  Example: site-a.com previews from `frontend-a.com`, while site-b.com uses `frontend-b.com`.

- 🌐 Template injection per language  
  Inject language-specific styles or markup depending on culture.

- 🎨 Domain-specific styling  
  Serve a different CSS file or template per domain.

- 🛠️ Anything else you need  
  If you can derive it from the page, culture, or domain — you can change it here.

## For Developers

The login for the sample Umbraco project (`Umbraco/Umbraco-17.2.0`) is admin@example.com / 1234567890

I develop up against my own headless project found at [kasparboelkjeldsen/kjeldsen.dev](https://github.com/kasparboelkjeldsen/kjeldsen.dev) and the testblock I use in this project is also implemented there for testing purposes.

## FAQ

- **Which editors are supported?**  
  Block List, Block Grid, and blocks used in the Rich Text Editor (RTE).  

- **Does it work with nested blocks?**  
  Yes — blocks inside blocks are supported.  

- **How is the API key used?**  
  A simple shared secret sent in the request header `kuhb-header`. You can check this in your frontend to control access.  

- **Does it support split view and block level variance?**  
  Yes

- **Do I need to register anything in `Startup.cs` or `Program.cs`?**  
  No. Everything is auto-registered.  

- **Where are settings stored?**  
  In `appsettings.json`, and preview-enabled blocks are persisted in `blockPreview/state.json` for version control.  

- **Can I use this with Razor-based frontends?**  
  Yes. Set `UseMVC: true` and your partial views render the previews — see [Razor / MVC mode](#razor--mvc-mode). Rick Butterfield's Razor-only package is another good option for traditional sites:  
  https://github.com/rickbutterfield/BlockPreview/

- **What happens if preview fails?**  
  The block falls back to Umbraco's default label with the reason underneath (for example "View '~/Views/Partials/blockgrid/Components/hero.cshtml' threw while rendering block 'hero': ..." or "Frontend at https://... did not respond within 30 seconds"), together with a short correlation id. The same failure is logged as a warning with page, culture, content type, target and elapsed time; set `Debug` to `true` to include full stack traces and successful requests.

## Changelog

### 1.5.0

- **Razor / MVC mode** (`UseMVC: true`): render blocks in-process through your own partial views, with configurable view folders, ModelsBuilder models, the correct `BlockGridItem`/`BlockListItem`/`RichTextBlockItem` type, page context (`Umbraco.AssignedContentItem`), culture, and link neutralisation.
- **Stylesheet endpoint** (`Stylesheets` + `/api/v1/Kraftvaerk.Umbraco.Headless.Blockpreview/css`) that makes site CSS work inside the backoffice shadow DOM.
- **Fix:** an unroutable page (unpublished, no domain, snapshot not yet updated) made the preview endpoint throw `UriFormatException` and every block on the page show "Internal Server Error". Domain resolution now tolerates "#"/relative URLs, walks up to the nearest routable ancestor, and never fails the preview.
- **Fix:** invalid page or content type ids no longer throw out of the action.
- **Fix:** `blockpreview/state.json` reads and writes are serialised and written atomically ("file is being used by another process").
- **Fix:** the preview endpoint now requires backoffice authorization (`[Authorize(Policy = BackOfficeAccess)]`).
- Failures are always logged with context and a correlation id, and the editor sees the actual reason instead of "Internal Server Error".
- Frontend timeout is configurable (`TimeoutSeconds`, default raised from 10 to 30) and cancelled when the editor moves on.
- The backoffice queues preview requests (`MaxConcurrentPreviews`, default 6), cancels superseded ones, and no longer double-fires the first request.
- The preview request now carries `editor`, `contentKey`, `columnSpan` and `rowSpan`.
- **Multilanguage fixes** (#4, #5, #6, by Mark Brunner and Mads Mørch Schou): the culture being edited is applied to the variation and thread context before any value is resolved, so nested blocks render in the right language; the backend model sent to the frontend carries `culture`; block labels render through UFM (`{umbValue:alias}`) and icon values with extra classes resolve correctly.
- Block data normalisation (editor shape → stored shape) now lives in `BlockValueNormalizer`, a pure class with unit tests. Nested block values whose entries lack an `editorAlias` are resolved through their content type, so multi node tree pickers inside nested blocks convert correctly.
- New `Kraftvaerk.Umbraco.Headless.BlockPreview.Tests` project (xUnit) with block JSON captured from the sample site. Run with `dotnet test`; the backend's npm build is skipped for test runs via `-p:BuildExtension=false`.

## License & Contributing

This package is open source and licensed under the [MIT License](https://opensource.org/licenses/MIT).

I welcome contributions! If you find a bug, want to improve something, or have an idea for a feature, feel free to open an issue or submit a pull request.

- Kaspar
