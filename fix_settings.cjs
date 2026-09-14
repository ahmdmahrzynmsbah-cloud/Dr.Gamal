const fs = require('fs');
const path = './src/components/SettingsManager.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace section headers
content = content.replace(/className="p-4 sm:p-5 border-b border-gray-50 bg-slate-50\/50 flex items-center justify-between text-right"/g, 
  'className="p-4 sm:p-5 border-b border-gray-50 bg-slate-50/50 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 text-right"');

// Replace toggles rows
content = content.replace(/className="p-3\.5 bg-slate-50\/80 rounded-xl border border-slate-200\/60 flex items-center justify-between gap-3"/g,
  'className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"');

// Replace specific label line 266
content = content.replace(/<div className="flex items-center justify-between">\s*<label className="block text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100">\s*تخصيص نغمة التنبيه/g,
  '<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">\n                <label className="block text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100">\n                  تخصيص نغمة التنبيه');

// Replace footer actions
content = content.replace(/className="flex items-center justify-between p-4 bg-slate-55\/10 border border-gray-150 rounded-2xl"/g,
  'className="flex flex-col md:flex-row flex-wrap items-start md:items-center justify-between gap-4 p-4 bg-slate-50/50 border border-gray-100 dark:border-gray-700 rounded-2xl"');

fs.writeFileSync(path, content, 'utf8');
console.log('Done');
