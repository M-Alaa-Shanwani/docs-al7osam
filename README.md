# Docs Hub
Static docs portal by dev-al7osam: Home stats, sidebar, name filter, tabs, auto-versioning, download, Arabic/English, password gate.

## Upload (recommended)
Use **Upload doc** in the sidebar. The site publishes the file to the GitHub repo via the API; Actions rebuilds the index and deploys.

1. Unlock the site with the access password.
2. On first publish, paste a GitHub Personal Access Token with **Contents: Read and write** (and repo access).
3. Fill name, created by, category, pick the `.html` file → Upload.

Optional: set owner/repo in `index.html` (`PUBLISH = { owner, repo, branch }`). On GitHub Pages this is auto-detected from the URL.

## Local run
`node scripts/build-manifest.mjs && npx serve .`

## Password
Change with: `node scripts/hash-password.mjs "YourNewPassword"` then replace `AUTH` in `index.html`.
