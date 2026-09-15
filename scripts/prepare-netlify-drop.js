const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const publish = path.join(root, 'netlify-drop');
const mirror = path.join(root, 'mirror-full');
const homepage = path.join(root, 'mirror-smoke', 'pages', 'index.html');
const maxOptionalPdfBytes = 1024 * 1024;

fs.rmSync(publish, { recursive: true, force: true });
fs.mkdirSync(publish, { recursive: true });
copyFile(homepage, path.join(publish, 'index.html'));
copyDirectory(path.join(mirror, 'pages'), publish, () => true);
copyDirectory(path.join(mirror, 'static'), publish, source => {
  const relative = path.relative(path.join(mirror, 'static'), source);
  if (path.extname(source).toLowerCase() !== '.pdf') return true;
  return relative.replaceAll('\\', '/') === 'results/SKU266920325-result.pdf' || fs.statSync(source).size <= maxOptionalPdfBytes;
});
fs.writeFileSync(path.join(publish, '_redirects'), '/* /index.html 200\n');
console.log(`Prepared ${publish}`);

function copyDirectory(source, destination, shouldCopy) {
  if (!fs.existsSync(source)) return;
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) copyDirectory(sourcePath, destinationPath, shouldCopy);
    else if (shouldCopy(sourcePath)) copyFile(sourcePath, destinationPath);
  }
}

function copyFile(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}
