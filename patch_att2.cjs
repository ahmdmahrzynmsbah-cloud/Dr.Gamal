const fs = require('fs');
let code = fs.readFileSync('src/components/StudentFullReport.tsx', 'utf8');

const targetTitle = `<h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1A7FAA] dark:text-sky-400" />
              سجل الحضور والغياب المفصل
            </h3>`;

const replacementTitle = `<h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1A7FAA] dark:text-sky-400" />
              سجل الحضور والغياب (لشهر {new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })})
            </h3>`;

code = code.replace(targetTitle, replacementTitle);
fs.writeFileSync('src/components/StudentFullReport.tsx', code);
