const express = require('express');

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.send('Headless BlockPreview example target is running. POST to /__blockpreview');
});

app.post('/__blockpreview', (req, res) => {
  const body = req.body || {};

  const { content, settings } = normalizePayload(body);

  const alias =
    content?.contentTypeAlias ||
    content?.contentType?.alias ||
    content?.contentType?.Alias ||
    content?.contentType ||
    body.contentTypeAlias ||
    body.contentType ||
    'unknown.block';

  const contentId = content?.id || body.id || 'n/a';
  const culture = content?.culture || body.culture || body.Culture || 'n/a';
  const apiKey = req.get('kuhb-header') || 'none';

  const html = `
    <div id="__preview" style="font-family: system-ui, sans-serif; padding: 16px; border: 1px solid #ddd; border-radius: 6px; background: #fff;">
      <h3 style="margin: 0 0 12px;">Example Block Preview</h3>
      <p style="margin: 0 0 8px;"><strong>Alias:</strong> ${escapeHtml(String(alias))}</p>
      <p style="margin: 0 0 8px;"><strong>ID:</strong> ${escapeHtml(String(contentId))}</p>
      <p style="margin: 0 0 12px;"><strong>Culture:</strong> ${escapeHtml(String(culture))}</p>
      <h4 style="margin: 12px 0 6px;">Content payload</h4>
      <pre style="white-space: pre-wrap; margin: 0 0 12px;">${escapeHtml(JSON.stringify(content, null, 2))}</pre>
      <h4 style="margin: 12px 0 6px;">Settings payload</h4>
      <pre style="white-space: pre-wrap; margin: 0;">${escapeHtml(JSON.stringify(settings, null, 2))}</pre>
      <p style="margin: 12px 0 0; opacity: 0.7;"><small>kuhb-header: ${escapeHtml(apiKey)}</small></p>
    </div>
  `;

  res.type('html').send(html);
});

function normalizePayload(body) {
  const wrappedContent = body.Content ?? body.content;
  const wrappedSettings = body.Settings ?? body.settings;

  if (wrappedContent !== undefined || wrappedSettings !== undefined) {
    return {
      content: parseMaybeJson(wrappedContent),
      settings: parseMaybeJson(wrappedSettings),
    };
  }

  return {
    content: parseMaybeJson(body),
    settings: null,
  };
}

function parseMaybeJson(value) {
  if (typeof value !== 'string') {
    return value ?? null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

app.listen(port, () => {
  console.log(`Example preview target running at http://localhost:${port}`);
});
