const fs = require('fs');
let content = fs.readFileSync('src/utils/db.ts', 'utf8');

const target = `function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}`;

const replace = `function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sams_db_sync', { detail: { key } }));
  }
}`;

content = content.replace(target, replace);
fs.writeFileSync('src/utils/db.ts', content, 'utf8');
