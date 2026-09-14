const fs = require('fs');

const path = './src/components/ClassesManager.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Insert full page archive view before selectedClassForStudents
const insertTarget = '  // Dedicated Group Students Full View Render\n  if (selectedClassForStudents) {';

const fullPageArchiveStr = `  // Full Page Archive View
  if (showArchiveModal) {
    return (
      <div className="space-y-6 animate-fade-in" dir="rtl">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowArchiveModal(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer flex items-center gap-2 font-bold text-sm"
            >
              <ArrowRight className="w-5 h-5" />
              <span>رجوع</span>
            </button>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">أرشيف الطلاب المؤرشفين</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">إدارة واستعادة أو حذف بيانات الطلاب نهائياً</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[70vh]">
          {/* Search */}
          <div className="relative shrink-0 mb-6">
            <Search className="w-5 h-5 text-slate-400 absolute right-4 top-3.5" />
            <input
              type="text"
              value={archivedSearchTerm}
              onChange={(e) => setArchivedSearchTerm(e.target.value)}
              placeholder="بحث في الطلاب المؤرشفين بالاسم أو رقم القيد..."
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pr-12 pl-4 py-3 text-sm focus:outline-none focus:border-amber-500 dark:focus:border-amber-600 font-sans transition-colors"
            />
          </div>

          {/* Archived list */}
          <div className="overflow-y-auto flex-1 space-y-3 pr-1">
            {(() => {
              const archivedList = samsDb.getArchivedStudents().filter(st => 
                !archivedSearchTerm || 
                st.name.includes(archivedSearchTerm) || 
                st.registration_id.includes(archivedSearchTerm)
              );

              if (archivedList.length === 0) {
                return (
                  <div className="text-center py-20 text-slate-400 space-y-3">
                    <Archive className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">لا يوجد طلاب في الأرشيف حالياً</p>
                  </div>
                );
              }

              return (
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
                              setSuccessText(\`تمت استعادة الطالب (\${st.name}) بنجاح وإعادته للقائمة النشطة.\`);
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
                    <table className="w-full text-sm text-right relative border-collapse min-w-[800px]">
                      <thead className="sticky top-0 z-20">
                        <tr className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-extrabold border-b-2 border-slate-300 dark:border-slate-700 shadow-xs whitespace-nowrap">
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs sm:text-sm pr-6 sticky top-0 z-20 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">م</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs sm:text-sm min-w-[200px] sticky top-0 z-20 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">بيانات الطالب</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs sm:text-sm min-w-[150px] sticky top-0 z-20 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">الصف الدراسي</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs sm:text-sm min-w-[140px] sticky top-0 z-20 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">رقم هاتف الطالب / ولي الأمر</th>
                          <th className="px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs sm:text-sm text-left pl-6 min-w-[160px] sticky top-0 z-20 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">إجراءات التحكم</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 whitespace-nowrap">
                        {archivedList.map((st, index) => (
                          <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm pr-6 text-xs text-slate-400 font-mono">
                              {(index + 1).toString().padStart(2, '0')}
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0 text-amber-500 font-bold text-sm sm:text-base sm:text-lg">
                                  <Archive className="w-5 h-5 opacity-50" />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">{st.name}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">#{st.registration_id}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                              <div className="flex flex-col gap-1">
                                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {st.grade_level}</span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                              <div className="flex flex-col gap-1 text-slate-600 dark:text-slate-400">
                                <span className="flex items-center gap-1 font-mono text-xs"><Phone className="w-3.5 h-3.5" /> {st.phone || st.parent_phone || '-'}</span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left pl-6">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    samsDb.restoreStudent(st.id);
                                    loadData();
                                    setSuccessText(\`تمت استعادة الطالب (\${st.name}) بنجاح وإعادته للقائمة النشطة.\`);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>استعادة</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setArchivedStudentToPermanentDelete(st)}
                                  className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>حذف نهائي</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Permanent Delete Modal for Archive view handled globally below */}
      </div>
    );
  }

  // Dedicated Group Students Full View Render
  if (selectedClassForStudents) {`;

content = content.replace(insertTarget, fullPageArchiveStr);

// 2. Remove the old Archived Students Modal logic further down
const startModalStr = '{/* Archived Students Modal */}';
const endModalStr = '        {/* Permanent Delete Confirmation Modal */}';

let modalStartIndex = content.indexOf(startModalStr);
let modalEndIndex = content.indexOf(endModalStr, modalStartIndex);

if (modalStartIndex !== -1 && modalEndIndex !== -1) {
  content = content.substring(0, modalStartIndex) + content.substring(modalEndIndex);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Modified to full page view');

