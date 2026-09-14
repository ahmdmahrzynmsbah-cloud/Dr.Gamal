const fs = require('fs');
const path = './src/components/SettingsManager.tsx';
let content = fs.readFileSync(path, 'utf8');

// The class we want to replace
const oldSelectClass = 'className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:outline-hidden focus:border-[#0D5C8C]"';
const newSelectClass = 'className="flex-1 min-w-0 truncate bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 sm:px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-[#0D5C8C]"';

content = content.replaceAll(oldSelectClass, newSelectClass);

// Also let's shrink the buttons slightly on mobile just in case
content = content.replace(/className="px-3 py-1.5 rounded-lg bg-\[#0D5C8C\]/g, 'className="px-2 sm:px-3 py-1.5 rounded-lg bg-[#0D5C8C]');
content = content.replace(/className="px-3 py-1.5 rounded-lg bg-emerald-600/g, 'className="px-2 sm:px-3 py-1.5 rounded-lg bg-emerald-600');
content = content.replace(/className="px-3 py-1.5 rounded-lg bg-indigo-600/g, 'className="px-2 sm:px-3 py-1.5 rounded-lg bg-indigo-600');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed settings');
