const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');

// Main list table
content = content.replace(
  /<div className="overflow-x-auto">\s*<table className="w-full text-sm text-right">\s*<thead className="bg-slate-50 dark:bg-slate-900\/50 text-slate-600 dark:text-slate-300 font-bold border-b border-gray-100 dark:border-gray-700 whitespace-nowrap">/g,
  `<div className="overflow-auto max-h-[calc(100vh-250px)]">
          <table className="w-full text-sm text-right">
              <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 font-bold shadow-sm whitespace-nowrap">`
);

// Archive list table
content = content.replace(
  /<div className="overflow-x-auto">\s*<table className="w-full text-sm text-right">\s*<thead className="bg-slate-50 dark:bg-slate-900\/50 text-slate-600 dark:text-slate-300 font-bold border-b border-gray-100 dark:border-gray-700 whitespace-nowrap">/g,
  `<div className="overflow-auto max-h-[calc(100vh-250px)]">
                  <table className="w-full text-sm text-right">
                    <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 font-bold shadow-sm whitespace-nowrap">`
);

fs.writeFileSync('src/components/StudentsList.tsx', content, 'utf8');
