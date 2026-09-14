const fs = require('fs');
const path = './src/components/ClassesManager.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldContainer = '<div className="bg-white dark:bg-slate-800 p-2 sm:p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs flex flex-col md:flex-row flex-wrap items-center gap-3 w-full pb-2 pt-1">';
const newContainer = '<div className="bg-white dark:bg-slate-800 p-2 sm:p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs flex flex-col gap-3 w-full pb-2 pt-1">';
content = content.replace(oldContainer, newContainer);

const oldSearch = '<div className="relative w-full md:flex-1 min-w-[280px]">';
const newSearch = '<div className="relative w-full">';
content = content.replace(oldSearch, newSearch);

const oldRibbon = '<div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 w-full md:w-auto">';
const newRibbon = '<div className="flex items-center gap-2 overflow-x-auto pb-1 w-full no-scrollbar">';
content = content.replace(oldRibbon, newRibbon);

content = content.replace(/className="w-full sm:w-auto/g, 'className="shrink-0 min-w-max');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed ClassesManager.tsx');
