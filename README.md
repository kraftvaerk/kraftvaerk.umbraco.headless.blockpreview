# Kraftvaerk.Umbraco.Headless.BlockPreview

Live preview of your blocks, right inside the backoffice - powered by your frontend.

⚡ **Works with Umbraco 16 and newer (including 17.0.0-beta)**  
🧩 **Supports Block List, Block Grid, and blocks inside RTE**  
🧠 **Headless and frontend-agnostic** — bring your own HTML  
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

## 🚀 Quickstart

### 1. Install the NuGet package

```bash
dotnet add package Kraftvaerk.Umbraco.Headless.BlockPreview
```

After the first startup, the package registers an appsettings schema, so you'll get IntelliSense support for its config.


### 2. Configure appsettings.json

```json
"HeadlessBlockPreview": {
  "Host": "http://localhost:3000",
  "Api": "/__blockpreview",
  "ApiKey": "woot",
  "Selector": "#__preview",
  "Template": "<link rel=\"stylesheet\" href=\"/cms.css\" /><style>.__block-preview { background: black; }</style><div class=\"__block-preview\">{{html}}</div>",
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

- **Debug**:  
  When set to `true`, failed previews are logged as errors using Umbraco's logging. When `false`, failures are silently ignored — helpful in production environments to avoid excessive log noise.

### 3. Implement a frontend preview endpoint

The package sends a `POST` request with the following payload:

```csharp
public class BlockPreviewBackendModel
{
    public IApiElement? Content { get; set; }
    public IApiElement? Settings { get; set; }
}
```

If your frontend uses Umbraco's Content Delivery API types, this should feel familiar — and easy to work with.

Here's a minimal Express server that echoes the request body as HTML:

```js
const express = require('express');
const app = express();
app.use(express.json());

app.post('/__blockpreview', (req, res) => {
  res.send(`<pre>${JSON.stringify(req.body, null, 2)}</pre>`);
});

app.listen(3000, () => {
  console.log('Preview server running on http://localhost:3000');
});
```

This just dumps the raw request. For actual previews, you'll want to render real components using your frontend framework of choice.

## 💾 Persistent settings

BlockPreview adds an extra tab to the editing workspace for blocks in the Block List and Block Grid editors, allowing you to toggle preview mode for each block.

Whenever you enable preview for a block (in a Block List, Block Grid, or RTE), that preference is saved to a local file:

**blockPreview/state.json**

This file contains the list of blocks that should use preview mode and their configuration. You can commit this file to your Git repository to ensure consistent behavior across environments.

## 🔧 Advanced: Per-site behavior

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

## ❓ For Developers

The login for the umbraco project(s) is admin@example.com / 1234567890

I develop up against my own headless project found at [kasparboelkjeldsen/kjeldsen.dev](https://github.com/kasparboelkjeldsen/kjeldsen.dev) and the testblock I use in this project is also implemented there for testing purposes.

## ❓ FAQ

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
  Absolutely — but you probably shouldn't. If you're not doing headless delivery, there's a great Razor-based block preview package by Rick Butterfield that's more suited to traditional Umbraco sites:  
  https://github.com/rickbutterfield/BlockPreview/

- **What happens if preview fails?**  
  If `Debug` is `false`, it fails silently. If `true`, failed attempts are logged as errors in Umbraco's logger.

## 📦 License & Contributing

This package is open source and licensed under the [MIT License](https://opensource.org/licenses/MIT).

I welcome contributions! If you find a bug, want to improve something, or have an idea for a feature, feel free to open an issue or submit a pull request.

- Kaspar
