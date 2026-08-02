const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');

const targetBtn = `            <button
              onClick={() => setShowArchiveModal(false)}
              className="p-2.5 bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
              title="رجوع"
            >
              <X className="w-5 h-5" />
            </button>`;

const newBtn = `            <button
              onClick={() => setShowArchiveModal(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer flex items-center gap-2 font-bold text-sm"
            >
              <ArrowRight className="w-5 h-5" />
              <span>رجوع</span>
            </button>`;

content = content.replace(targetBtn, newBtn);
fs.writeFileSync('src/components/StudentsList.tsx', content, 'utf8');
