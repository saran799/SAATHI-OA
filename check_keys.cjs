const fs = require('fs');
const path = require('path');

// We need to parse en.ts since it's ES module or TS. It might be easier to just regex the keys from en.ts
const enTsContent = fs.readFileSync(path.join(__dirname, 'src', 'i18n', 'en.ts'), 'utf8');

// Actually, I can just use ts-node or compile it. Since it's vite, I can use tsx or esbuild.
// Let's just find the keys from all files and print them.
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
const keys = new Set();

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const regex = /t\(['"`]([^'"`\$\{]+)['"`]\)/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1]);
  }
});

// Now let's check en.ts for these keys using regex.
const missing = [];
keys.forEach(key => {
  const parts = key.split('.');
  const lastPart = parts[parts.length - 1];
  // naive check: just see if lastPart is in en.ts
  if (!enTsContent.includes(lastPart)) {
    missing.push(key);
  }
});

console.log('Potentially missing keys:', missing);
