const fs = require('fs');
const path = './src/components/StudentsList.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStr = `              return (
                <div className="overflow-auto max-h-[calc(100vh-250px)]">
          <table className="w-full text-sm text-right relative border-collapse">`;

const replacementStr = `              return (
                <>
                  {/* Mobile Card View */}
                  <div className="md:hidden flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-250px)] pb-10">
                    {archivedList.map(st => (
                      <div key={st.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0 text-amber-500">
                              <Archive className="w-5 h-5 opacity-50" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">{st.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">#{st.registration_id}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-semibold">الصف الدراسي</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {st.grade_level}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400 font-semibold">رقم الهاتف</span>
                            <span className="flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-300"><Phone className="w-3.5 h-3.5" /> {st.phone || st.parent_phone || '-'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                          <button
                            type="button"
                            onClick={() => {
                              samsDb.restoreStudent(st.id);
                              loadData();
                              setSuccessMessage(\`تمت استعادة الطالب (\${st.name}) بنجاح وإعادته للقائمة النشطة.\`);
                            }}
                            className="flex-1 py-2 bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>استعادة</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setArchivedStudentToPermanentDelete(st)}
                            className="flex-1 py-2 bg-rose-50 dark:bg-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف نهائي</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-auto max-h-[calc(100vh-250px)] rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                    <table className="w-full text-sm text-right relative border-collapse min-w-[800px]">`;

if(content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  // Also we need to fix the closing tags. Wait, let me check how it closes.
} else {
  console.log("Could not find target string.");
}

fs.writeFileSync(path, content, 'utf8');
