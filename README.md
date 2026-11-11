# UK Circles

Click anywhere on an OpenStreetMap view to place a centre, then draw concentric circles with spacing and count controls. The URL stays in sync so views are shareable.

## Local development

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## GitHub Pages

Deployed automatically on every push to `main` via GitHub Actions.

One-time repo setting: **Settings → Pages → Source = GitHub Actions**.

Live site: https://davidgroves.github.io/uk-circles/

## URL parameters

| Param | Meaning |
|-------|---------|
| `lat`, `lng` | Circle centre |
| `vlat`, `vlng` | Map viewport centre |
| `z` | Zoom |
| `spacing` | Ring spacing in metres |
| `count` | Number of rings |
