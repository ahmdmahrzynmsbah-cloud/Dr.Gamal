const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Add dark equivalents for all specific color hovers
  content = content.replace(/hover:bg-sky-50\/40(?!.*dark:hover:bg-)/g, 'hover:bg-sky-50/40 dark:hover:bg-slate-800/50');
  content = content.replace(/hover:bg-blue-50\/30(?!.*dark:hover:bg-)/g, 'hover:bg-blue-50/30 dark:hover:bg-slate-800/50');
  content = content.replace(/hover:bg-blue-50(?!.*dark:hover:bg-)/g, 'hover:bg-blue-50 dark:hover:bg-slate-800/50');
  content = content.replace(/hover:bg-gray-50(?!.*dark:hover:bg-)/g, 'hover:bg-gray-50 dark:hover:bg-slate-800/50');
  
  content = content.replace(/hover:bg-emerald-50(?!.*dark:hover:bg-)/g, 'hover:bg-emerald-50 dark:hover:bg-emerald-900/40');
  content = content.replace(/hover:bg-rose-50(?!.*dark:hover:bg-)/g, 'hover:bg-rose-50 dark:hover:bg-rose-900/40');
  content = content.replace(/hover:bg-amber-50(?!.*dark:hover:bg-)/g, 'hover:bg-amber-50 dark:hover:bg-amber-900/40');
  content = content.replace(/hover:bg-red-50(?!.*dark:hover:bg-)/g, 'hover:bg-red-50 dark:hover:bg-red-900/40');
  content = content.replace(/hover:bg-sky-50(?!.*dark:hover:bg-)/g, 'hover:bg-sky-50 dark:hover:bg-sky-900/40');


  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated hovers in ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

processDirectory('src/components');

