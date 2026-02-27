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
    content?.contentType?.alias ||
    content?.contentType?.Alias ||
    content?.contentType ||
    content?.contentTypeAlias ||
    body.contentTypeAlias ||
    body.contentType ||
    'unknown.block';

  const renderedHtml = renderBlock(alias, content, settings);
  const html = `<!DOCTYPE html><html><body><div id="__preview">${renderedHtml}</div></body></html>`;
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

function renderBlock(contentType, content, settings) {
  const props = extractApiElementProperties(content);

  const textValue = props.text || props.Text || '';
  return `
    <div style="padding: 16px; color: white; font-family: system-ui, sans-serif;">
      <h2 style="margin: 0 0 16px;">${escapeHtml(String(textValue))}</h2>
      <p style="margin: 0; font-size: 0.9em; opacity: 0.8;">Content Type: ${escapeHtml(String(contentType))}</p>
    </div>
  `;
}

function extractApiElementProperties(content) {
  if (!content) return {};
  if (content.properties && typeof content.properties === 'object' && !Array.isArray(content.properties)) {
    return content.properties;
  }
  return content;
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
