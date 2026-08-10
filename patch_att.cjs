const fs = require('fs');
let code = fs.readFileSync('src/components/StudentFullReport.tsx', 'utf8');

const target = `                  <div key={att.id} className={\`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 \${
                    att.status === 'present' ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-100 dark:border-emerald-800' :
                    att.status === 'absent' ? 'bg-rose-50 dark:bg-rose-900/40 border-rose-100 dark:border-rose-800' :
                    'bg-amber-50 dark:bg-amber-900/40 border-amber-100 dark:border-amber-800'
                  }\`}>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{new Date(att.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}</span>
                    <span className={\`text-[11px] font-extrabold px-2 py-0.5 rounded-md \${
                      att.status === 'present' ? 'bg-emerald-200 text-emerald-800' :
                      att.status === 'absent' ? 'bg-rose-200 text-rose-800' :
                      'bg-amber-200 text-amber-800'
                    }\`}>`;

const replacement = `                  <div key={att.id} className={\`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 \${
                    att.status === 'present' ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-800 print:border-emerald-600' :
                    att.status === 'absent' ? 'bg-rose-50 dark:bg-rose-900/40 border-rose-300 dark:border-rose-800 print:border-rose-600' :
                    'bg-amber-50 dark:bg-amber-900/40 border-amber-300 dark:border-amber-800 print:border-amber-600'
                  }\`}>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 print:text-black">{new Date(att.date).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric' })}</span>
                    <span className={\`text-xs font-black px-3 py-1 rounded-md print:border-2 \${
                      att.status === 'present' ? 'bg-emerald-200 text-emerald-900 print:border-emerald-600 print:text-emerald-800' :
                      att.status === 'absent' ? 'bg-rose-200 text-rose-900 print:border-rose-600 print:text-rose-800' :
                      'bg-amber-200 text-amber-900 print:border-amber-600 print:text-amber-800'
                    }\`}>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/StudentFullReport.tsx', code);
