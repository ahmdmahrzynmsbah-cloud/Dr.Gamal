const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const addColorfulDark = (str) => {
    return str.replace(/className=(["'])(.*?)\1/g, (match, quote, classNames) => {
      let classes = classNames.split(/\s+/).filter(Boolean);
      let newClasses = [];
      
      for (const cls of classes) {
        newClasses.push(cls);
        
        // Backgrounds
        if (cls === 'bg-emerald-50' && !classes.some(c => c.startsWith('dark:bg-emerald'))) newClasses.push('dark:bg-emerald-900/40');
        if (cls === 'bg-rose-50' && !classes.some(c => c.startsWith('dark:bg-rose'))) newClasses.push('dark:bg-rose-900/40');
        if (cls === 'bg-amber-50' && !classes.some(c => c.startsWith('dark:bg-amber'))) newClasses.push('dark:bg-amber-900/40');
        if (cls === 'bg-indigo-50' && !classes.some(c => c.startsWith('dark:bg-indigo'))) newClasses.push('dark:bg-indigo-900/40');
        if (cls === 'bg-sky-50' && !classes.some(c => c.startsWith('dark:bg-sky'))) newClasses.push('dark:bg-sky-900/40');
        if (cls === 'bg-blue-50' && !classes.some(c => c.startsWith('dark:bg-blue'))) newClasses.push('dark:bg-blue-900/40');
        if (cls === 'bg-red-50' && !classes.some(c => c.startsWith('dark:bg-red'))) newClasses.push('dark:bg-red-900/40');
        if (cls === 'bg-purple-50' && !classes.some(c => c.startsWith('dark:bg-purple'))) newClasses.push('dark:bg-purple-900/40');
        if (cls === 'bg-orange-50' && !classes.some(c => c.startsWith('dark:bg-orange'))) newClasses.push('dark:bg-orange-900/40');

        // Borders
        if (cls === 'border-emerald-100' && !classes.some(c => c.startsWith('dark:border-emerald'))) newClasses.push('dark:border-emerald-800');
        if (cls === 'border-emerald-200' && !classes.some(c => c.startsWith('dark:border-emerald'))) newClasses.push('dark:border-emerald-700');
        if (cls === 'border-rose-100' && !classes.some(c => c.startsWith('dark:border-rose'))) newClasses.push('dark:border-rose-800');
        if (cls === 'border-rose-200' && !classes.some(c => c.startsWith('dark:border-rose'))) newClasses.push('dark:border-rose-700');
        if (cls === 'border-amber-100' && !classes.some(c => c.startsWith('dark:border-amber'))) newClasses.push('dark:border-amber-800');
        if (cls === 'border-amber-200' && !classes.some(c => c.startsWith('dark:border-amber'))) newClasses.push('dark:border-amber-700');
        if (cls === 'border-indigo-100' && !classes.some(c => c.startsWith('dark:border-indigo'))) newClasses.push('dark:border-indigo-800');
        if (cls === 'border-sky-100' && !classes.some(c => c.startsWith('dark:border-sky'))) newClasses.push('dark:border-sky-800');
        if (cls === 'border-blue-100' && !classes.some(c => c.startsWith('dark:border-blue'))) newClasses.push('dark:border-blue-800');
        if (cls === 'border-red-100' && !classes.some(c => c.startsWith('dark:border-red'))) newClasses.push('dark:border-red-800');
        if (cls === 'border-orange-100' && !classes.some(c => c.startsWith('dark:border-orange'))) newClasses.push('dark:border-orange-800');
        
        // Texts
        if (cls === 'text-emerald-700' && !classes.some(c => c.startsWith('dark:text-emerald'))) newClasses.push('dark:text-emerald-300');
        if (cls === 'text-emerald-800' && !classes.some(c => c.startsWith('dark:text-emerald'))) newClasses.push('dark:text-emerald-300');
        if (cls === 'text-rose-700' && !classes.some(c => c.startsWith('dark:text-rose'))) newClasses.push('dark:text-rose-300');
        if (cls === 'text-rose-600' && !classes.some(c => c.startsWith('dark:text-rose'))) newClasses.push('dark:text-rose-400');
        if (cls === 'text-amber-700' && !classes.some(c => c.startsWith('dark:text-amber'))) newClasses.push('dark:text-amber-300');
        if (cls === 'text-amber-800' && !classes.some(c => c.startsWith('dark:text-amber'))) newClasses.push('dark:text-amber-300');
        if (cls === 'text-amber-600' && !classes.some(c => c.startsWith('dark:text-amber'))) newClasses.push('dark:text-amber-400');
        if (cls === 'text-indigo-700' && !classes.some(c => c.startsWith('dark:text-indigo'))) newClasses.push('dark:text-indigo-300');
        if (cls === 'text-sky-700' && !classes.some(c => c.startsWith('dark:text-sky'))) newClasses.push('dark:text-sky-300');
        if (cls === 'text-blue-700' && !classes.some(c => c.startsWith('dark:text-blue'))) newClasses.push('dark:text-blue-300');
        if (cls === 'text-blue-800' && !classes.some(c => c.startsWith('dark:text-blue'))) newClasses.push('dark:text-blue-300');
        if (cls === 'text-red-600' && !classes.some(c => c.startsWith('dark:text-red'))) newClasses.push('dark:text-red-400');
        if (cls === 'text-red-700' && !classes.some(c => c.startsWith('dark:text-red'))) newClasses.push('dark:text-red-300');
        if (cls === 'text-[#1A7FAA]' && !classes.some(c => c.startsWith('dark:text-sky'))) newClasses.push('dark:text-sky-400');
        if (cls === 'text-slate-800' && !classes.some(c => c.startsWith('dark:text-slate'))) newClasses.push('dark:text-slate-100');
      }
      return `className=${quote}${newClasses.join(' ')}${quote}`;
    });
  };

  const newContent = addColorfulDark(content);
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated colorful backgrounds in ${filePath}`);
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

