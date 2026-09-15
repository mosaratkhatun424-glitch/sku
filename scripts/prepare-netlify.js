const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const publish = path.join(root, 'netlify-dist');
const mirror = path.join(root, 'mirror-full');
const homepage = path.join(root, 'mirror-smoke', 'pages', 'index.html');

fs.rmSync(publish, { recursive: true, force: true });
fs.mkdirSync(publish, { recursive: true });
copyFile(homepage, path.join(publish, 'index.html'));
copyDirectory(path.join(mirror, 'pages'), publish);
copyDirectory(path.join(mirror, 'static'), publish);
fs.writeFileSync(path.join(publish, '_redirects'), '/* /index.html 200\n');
console.log(`Prepared ${publish}`);

function copyDirectory(source, destination) {
  if (!fs.existsSync(source)) return;
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) { fs.mkdirSync(destinationPath, { recursive: true }); copyDirectory(sourcePath, destinationPath); }
    else copyFile(sourcePath, destinationPath);
  }
}

function copyFile(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}
