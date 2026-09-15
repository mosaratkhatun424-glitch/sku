const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const mirror = path.join(root, fs.existsSync(path.join(root, 'mirror-full')) ? 'mirror-full' : 'mirror-smoke');
const staticRoot = path.join(mirror, 'static');
const homepage = path.join(root, 'mirror-smoke', 'pages', 'index.html');
const port = Number(process.env.PORT || 5173);
const mimeTypes = { '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.woff': 'font/woff', '.woff2': 'font/woff2' };

function localize(html) {
  const localized = html
    .replaceAll('https://www.skuindia.ac.in', '')
    .replaceAll('http://skuindia.ac.in', '')
    .replaceAll('https://skuindia.ac.in', '');
  const sharedStyles = `<style id="local-clone-overrides">
    .footer { background: #fff url('/Content/images/footer.jpg') center center / cover no-repeat !important; color: #333 !important; }
    .info__box { min-height: 170px !important; height: 170px !important; padding: 20px !important; overflow: hidden; background-size: cover !important; background-position: center !important; }
    .info__box h5 { margin-top: 0; }
    .box__abcd { padding: 0 !important; }
    .box__abcd .abcd-link { position: relative; display: block; height: 170px; color: #fff !important; font-size: 1.6rem; font-weight: 700; overflow: hidden; }
    .box__abcd .abcd-link img { width: 100%; height: 100%; object-fit: cover; filter: brightness(.6); }
    .box__abcd .abcd-link span { position: absolute; inset: 0; display: grid; place-items: center; }
    .box__highlight__x { background-image: linear-gradient(rgb(82 51 40 / 3%), rgb(33 33 33 / 85%)), url('/Content/web/university/infra/sku-infra-1.webp') !important; }
    .box__virtualtour { background: linear-gradient(rgb(82 51 40 / 3%), rgb(33 33 33 / 85%)), url('/Content/web/university/infra/sku-infra-2.webp') center / cover !important; }
    .box__registration { background-image: linear-gradient(rgb(82 51 40 / 3%), rgb(52 35 29 / 85%)), url('/Content/web/university/infra/sku-infra-3.webp') !important; }
    .box__admission_enquiry { background-image: linear-gradient(rgb(61 135 237 / 35%), rgb(9 100 153 / 88%)), url('/Content/web/university/infra/sku-infra-4.webp') !important; }
    .box__syllabus { background-image: linear-gradient(rgb(82 51 40 / 3%), rgb(52 35 29 / 85%)), url('/Content/web/university/infra/sku-infra-5.webp') !important; }
    .box__exam__timetable { background-image: linear-gradient(#ffffff00, rgb(219 168 14 / 93%)), url('/Content/web/university/infra/sku-infra-1.webp') !important; }
    .box__media__gallery { background-image: linear-gradient(rgb(82 51 40 / 3%), rgb(28 81 30 / 85%)), url('/Content/web/university/infra/sku-infra-2.webp') !important; }
  </style>`;
  return localized.includes('</body>') ? localized.replace('</body>', `${sharedStyles}</body>`) : `${localized}${sharedStyles}`;
}

function safePath(base, requestPath) {
  const target = path.resolve(base, '.' + decodeURIComponent(requestPath));
  return target.startsWith(path.resolve(base)) ? target : null;
}

const server = http.createServer((request, response) => {
  const requestPath = new URL(request.url, `http://${request.headers.host}`).pathname;
  let file = null;
  let isHtml = false;

  if (requestPath === '/' || requestPath.endsWith('.html') || !path.extname(requestPath)) {
    const routeFile = safePath(path.join(mirror, 'pages'), requestPath === '/' ? '/index.html' : requestPath + (requestPath.endsWith('/') ? 'index.html' : ''));
    file = requestPath === '/' ? homepage : (routeFile && fs.existsSync(routeFile) ? routeFile : homepage);
    isHtml = true;
  } else {
    file = safePath(staticRoot, requestPath);
  }

  if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  const body = fs.readFileSync(file);
  const contentType = isHtml ? 'text/html; charset=utf-8' : (mimeTypes[path.extname(file).toLowerCase()] || 'application/octet-stream');
  response.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
  response.end(isHtml ? localize(body.toString('utf8')) : body);
});

server.listen(port, () => console.log(`SKU local clone listening at http://localhost:${port}`));
