const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');

const oldGrid = `<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {archivedList.map(st => (
                    <div key={st.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans hover:border-amber-200 dark:hover:border-amber-700 transition-colors">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{st.name}</span>
                          <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md font-mono font-bold border border-amber-200 dark:border-amber-800">
                            {st.registration_id}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-3">
                          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {st.grade_level}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {st.phone || st.parent_phone || '-'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {/* Restore */}
                        <button
                          type="button"
                          onClick={() => {
                            samsDb.restoreStudent(st.id);
                            loadData();
                            setSuccessMessage(\`تمت استعادة الطالب (\${st.name}) بنجاح وإعادته للقائمة النشطة.\`);
                          }}
                          className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>استعادة</span>
                        </button>

                        {/* Permanent Delete */}
                        <button
                          type="button"
                          onClick={() => setArchivedStudentToPermanentDelete(st)}
                          className="px-3 py-2 bg-rose-50 dark:bg-rose-900/40 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>حذف نهائي</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>`;

const newTable = `<div className="overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 font-bold border-b border-gray-100 dark:border-gray-700 whitespace-nowrap">
                      <tr>
                        <th className="px-4 py-4 pr-6">م</th>
                        <th className="px-4 py-4 min-w-[200px]">بيانات الطالب</th>
                        <th className="px-4 py-4 min-w-[150px]">الصف الدراسي</th>
                        <th className="px-4 py-4 min-w-[140px]">رقم هاتف الطالب / ولي الأمر</th>
                        <th className="px-4 py-4 text-left pl-6 min-w-[160px]">إجراءات التحكم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 whitespace-nowrap">
                      {archivedList.map((st, index) => (
                        <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3 pr-6 text-xs text-slate-400 font-mono">
                            {(index + 1).toString().padStart(2, '0')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0 text-amber-500 font-bold text-lg">
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
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {st.grade_level}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1 text-slate-600 dark:text-slate-400">
                              <span className="flex items-center gap-1 font-mono text-xs"><Phone className="w-3.5 h-3.5" /> {st.phone || st.parent_phone || '-'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-left pl-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  samsDb.restoreStudent(st.id);
                                  loadData();
                                  setSuccessMessage(\`تمت استعادة الطالب (\${st.name}) بنجاح وإعادته للقائمة النشطة.\`);
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
                </div>`;

if (content.includes(oldGrid)) {
  content = content.replace(oldGrid, newTable);
  fs.writeFileSync('src/components/StudentsList.tsx', content, 'utf8');
  console.log('Successfully updated the table.');
} else {
  console.error('Could not find old grid layout block.');
}
