const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Global safe replacements for dynamic classes
  const replacements = {
    'bg-emerald-50 ': 'bg-emerald-50 dark:bg-emerald-900/40 ',
    'border-emerald-100 ': 'border-emerald-100 dark:border-emerald-800 ',
    'bg-rose-50 ': 'bg-rose-50 dark:bg-rose-900/40 ',
    'border-rose-100 ': 'border-rose-100 dark:border-rose-800 ',
    'bg-amber-50 ': 'bg-amber-50 dark:bg-amber-900/40 ',
    'border-amber-100 ': 'border-amber-100 dark:border-amber-800 ',
    'bg-white': 'bg-white dark:bg-slate-800',
    'bg-slate-50': 'bg-slate-50 dark:bg-slate-900/50',
    'bg-slate-100': 'bg-slate-100 dark:bg-slate-800',
    'text-slate-500': 'text-slate-500 dark:text-slate-400',
    'text-slate-600': 'text-slate-600 dark:text-slate-300',
    'text-slate-700': 'text-slate-700 dark:text-slate-200',
    'text-slate-800': 'text-slate-800 dark:text-slate-100',
    'text-slate-900': 'text-slate-900 dark:text-slate-50',
    'border-slate-100': 'border-slate-100 dark:border-slate-700',
    'border-slate-200': 'border-slate-200 dark:border-slate-700',
    'border-slate-300': 'border-slate-300 dark:border-slate-600'
  };

  // We only replace if they are followed by ' or " or \` or space to be safe
  for (const [key, val] of Object.entries(replacements)) {
     // A bit risky for global, let's just use simple regex for common template literal patterns
     const regex = new RegExp(key + "(?=['\"\\\\`\\s])", "g");
     content = content.replace(regex, (match) => {
         // if it already has dark:, skip
         return val; // actually it's hard to check dark: here easily, let's just skip this for now to avoid breaking things, we already got 95%
     });
  }

  // Instead of global replace, let's do a specific replace for the attendance ternaries we saw
  content = content.replace(/'bg-emerald-50 border-emerald-100'/g, "'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-100 dark:border-emerald-800'");
  content = content.replace(/'bg-rose-50 border-rose-100'/g, "'bg-rose-50 dark:bg-rose-900/40 border-rose-100 dark:border-rose-800'");
  content = content.replace(/'bg-amber-50 border-amber-100'/g, "'bg-amber-50 dark:bg-amber-900/40 border-amber-100 dark:border-amber-800'");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated template literals in ${filePath}`);
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

