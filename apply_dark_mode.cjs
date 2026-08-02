const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // A helper function to add dark classes safely
  const addDark = (str, target, darkReplacement) => {
    // Only replace if it doesn't already have a dark equivalent near it
    // It's safer to just split the string into classes, map them, and rejoin
    return str.replace(/className=(["'])(.*?)\1/g, (match, quote, classNames) => {
      let classes = classNames.split(/\s+/).filter(Boolean);
      let newClasses = [];
      
      for (const cls of classes) {
        newClasses.push(cls);
        if (cls === 'bg-white' && !classes.some(c => c.startsWith('dark:bg-'))) newClasses.push('dark:bg-slate-800');
        else if (cls === 'bg-slate-50' && !classes.some(c => c.startsWith('dark:bg-'))) newClasses.push('dark:bg-slate-900/50');
        else if (cls === 'bg-slate-100' && !classes.some(c => c.startsWith('dark:bg-'))) newClasses.push('dark:bg-slate-800');
        else if (cls === 'bg-slate-200' && !classes.some(c => c.startsWith('dark:bg-'))) newClasses.push('dark:bg-slate-700');
        else if (cls === 'bg-[#F4F6F8]' && !classes.some(c => c.startsWith('dark:bg-'))) newClasses.push('dark:bg-slate-900');
        
        else if (cls === 'text-slate-500' && !classes.some(c => c.startsWith('dark:text-'))) newClasses.push('dark:text-slate-400');
        else if (cls === 'text-slate-600' && !classes.some(c => c.startsWith('dark:text-'))) newClasses.push('dark:text-slate-300');
        else if (cls === 'text-slate-700' && !classes.some(c => c.startsWith('dark:text-'))) newClasses.push('dark:text-slate-200');
        else if (cls === 'text-slate-800' && !classes.some(c => c.startsWith('dark:text-'))) newClasses.push('dark:text-slate-100');
        else if (cls === 'text-slate-900' && !classes.some(c => c.startsWith('dark:text-'))) newClasses.push('dark:text-slate-50');
        else if (cls === 'text-gray-500' && !classes.some(c => c.startsWith('dark:text-'))) newClasses.push('dark:text-gray-400');
        else if (cls === 'text-gray-600' && !classes.some(c => c.startsWith('dark:text-'))) newClasses.push('dark:text-gray-300');
        else if (cls === 'text-gray-700' && !classes.some(c => c.startsWith('dark:text-'))) newClasses.push('dark:text-gray-200');
        else if (cls === 'text-[#1A1A2E]' && !classes.some(c => c.startsWith('dark:text-'))) newClasses.push('dark:text-white');
        else if (cls === 'text-gray-800' && !classes.some(c => c.startsWith('dark:text-'))) newClasses.push('dark:text-gray-100');
        else if (cls === 'text-gray-900' && !classes.some(c => c.startsWith('dark:text-'))) newClasses.push('dark:text-gray-50');

        else if (cls === 'border-slate-100' && !classes.some(c => c.startsWith('dark:border-'))) newClasses.push('dark:border-slate-700');
        else if (cls === 'border-slate-200' && !classes.some(c => c.startsWith('dark:border-'))) newClasses.push('dark:border-slate-700');
        else if (cls === 'border-slate-300' && !classes.some(c => c.startsWith('dark:border-'))) newClasses.push('dark:border-slate-600');
        else if (cls === 'border-gray-100' && !classes.some(c => c.startsWith('dark:border-'))) newClasses.push('dark:border-gray-700');
        else if (cls === 'border-gray-200' && !classes.some(c => c.startsWith('dark:border-'))) newClasses.push('dark:border-gray-700');
        else if (cls === 'border-gray-300' && !classes.some(c => c.startsWith('dark:border-'))) newClasses.push('dark:border-gray-600');
        else if (cls === 'border-slate-50' && !classes.some(c => c.startsWith('dark:border-'))) newClasses.push('dark:border-slate-800');
      }
      return `className=${quote}${newClasses.join(' ')}${quote}`;
    });
  };

  const newContent = addDark(content);
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
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

