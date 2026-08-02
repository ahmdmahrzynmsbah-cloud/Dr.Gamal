const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Fix the invalid dark classes injected earlier
  content = content.replace(/dark:bg-slate-900\/50 dark:bg-slate-900\/50/g, 'dark:bg-slate-900/50');
  content = content.replace(/dark:text-slate-300 dark:text-slate-300/g, 'dark:text-slate-300');
  content = content.replace(/dark:text-slate-400 dark:text-slate-400/g, 'dark:text-slate-400');
  content = content.replace(/dark:text-slate-200 dark:text-slate-200/g, 'dark:text-slate-200');
  content = content.replace(/dark:text-slate-50 dark:text-slate-50/g, 'dark:text-slate-50');
  content = content.replace(/dark:border-slate-700 dark:border-slate-700/g, 'dark:border-slate-700');
  content = content.replace(/dark:bg-slate-800 dark:bg-slate-800/g, 'dark:bg-slate-800');

  // Fix hover:bg-slate-50 with no dark equivalent or wrong dark equivalent (like dark:bg- instead of dark:hover:bg-)
  content = content.replace(/hover:bg-slate-50 dark:bg-slate-900\/50/g, 'hover:bg-slate-50 dark:hover:bg-slate-800/50');
  content = content.replace(/hover:bg-slate-50(?!.*dark:hover:bg-)/g, 'hover:bg-slate-50 dark:hover:bg-slate-800/50');
  
  content = content.replace(/hover:bg-slate-50\/50(?!.*dark:hover:bg-)/g, 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40');
  content = content.replace(/hover:bg-slate-100 dark:bg-slate-800/g, 'hover:bg-slate-100 dark:hover:bg-slate-800/80');
  content = content.replace(/hover:bg-slate-100(?!.*dark:hover:bg-)/g, 'hover:bg-slate-100 dark:hover:bg-slate-800/80');


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
processFile('src/App.tsx');

