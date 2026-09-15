# SKU Website Local Clone

Static local mirror of the public Shri Krishna University website.

## Run locally

Requirements: Node.js 18+ and internet access only when crawling.

```powershell
npm install
npm run dev
```

Open http://localhost:5173/.

## Update the mirror

```powershell
npm run crawl
npm run backfill-assets
npm run check-links
```

The crawler saves public HTML routes to `mirror-full/pages` and local resources to `mirror-full/static`. Admin/authenticated routes and third-party services are intentionally excluded. Download failures are recorded in `clone-manifest.json` and `asset-backfill-report.json`.

## GitHub Pages and custom domain

1. Push the repository to GitHub.
2. In **Settings > Pages**, choose **GitHub Actions** as the source.
3. Deploy the static `mirror-full` directory. The included Node server is for local use; GitHub Pages serves files directly.
4. Add a `CNAME` file inside `mirror-full` containing your domain, such as `www.example.com`.
5. Add the matching DNS `CNAME` record pointing to `<github-user>.github.io`, then set the custom domain in GitHub Pages.

GitHub Pages does not run `server.js`, so route files must be published as static files. Server-side forms remain unavailable. Do not publish credentials or private data.

## Netlify deployment

1. Push the repository to GitHub.
2. In Netlify, choose **Add new site > Import an existing project** and select the repository.
3. Use build command `npm run build:netlify` and publish directory `netlify-dist`.
4. Deploy. The build creates the static site, copies the local assets, and generates the result PDF.
5. For a custom domain, open **Domain management > Add a domain**, then add the DNS records Netlify provides.

The result lookup is intentionally static: only enrollment `SKU266920325` and DOB `15-02-2002` return the sample marks. Replace `mirror-full/static/results/SKU266920325-result.pdf` with the final PDF before deploying.

### Drag-and-drop deployment

The full mirror is large because it contains many historical PDFs. Build a smaller upload bundle with:

```powershell
npm run build:netlify-drop
Compress-Archive -Path .\netlify-drop\* -DestinationPath .\sku-netlify-drop.zip -Force
```

In Netlify, drag `sku-netlify-drop.zip` into the deploy area, or drag the `netlify-drop` folder itself. The bundle keeps the website pages, styles, scripts, images, course thumbnails, result form, and result PDF. Large optional historical PDFs are excluded to keep the upload manageable.

The generated files are approximately 52 MB uncompressed and 39 MB as a ZIP. The ZIP has `index.html` at its root, which is required by Netlify's drag-and-drop deploy.

## Status

The clone contains 113 captured public pages and 301 local assets. The homepage, shared layout, footer background, course thumbnails, navigation, and responsive source styles are preserved. Seven source resources remain unavailable because the origin returned 404, 403, or timed out; see `clone-manifest.json`.

This is not fully production-ready as a public website yet. It is suitable for static visual publishing after testing GitHub Pages route behavior, custom-domain DNS, forms, third-party embeds, and the documented missing resources.