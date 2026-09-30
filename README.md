# Docs Hub
Static docs portal by dev-al7osam: Home stats, sidebar, name filter, tabs, auto-versioning, download.

## Add docs (shared with the team)
Put an `.html` file in `docs/backend/`, `docs/frontend/` or `docs/third-party/` and push to `main`.
GitHub Actions rebuilds `docs.json` and deploys to GitHub Pages (Settings → Pages → Source: GitHub Actions).
Duplicate names auto-version: `name`, `name v1`, `name v2`…

## Upload button
Uploads from the UI are stored in that browser only (IndexedDB). To share one, download it and commit it to `docs/<category>/`.

## Local run
`node scripts/build-manifest.mjs && npx serve .`
