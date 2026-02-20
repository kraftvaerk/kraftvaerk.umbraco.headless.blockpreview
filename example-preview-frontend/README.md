# Example Preview Frontend Target

Minimal Node/Express target for testing `Kraftvaerk.Umbraco.Headless.BlockPreview`.

## Run

```bash
npm install
npm start
```

Server defaults to `http://localhost:3001` and exposes:

- `GET /` health message
- `POST /__blockpreview` returns HTML with `#__preview` wrapper and payload details

Optional:

```bash
set PORT=3001 && npm start
```
