const fs = require('fs');
const path = './src/components/ClassesManager.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the buggy table replacement with the correct one
const mobileStartString = '{/* Mobile Card View (responsive) */}';
const mobileEndString = '{/* Desktop Table View */}';

if (content.includes(mobileStartString) && content.includes(mobileEndString)) {
  const startIndex = content.indexOf(mobileStartString);
  const endIndex = content.indexOf(mobileEndString) + mobileEndString.length;
  
  const replacement = `
              {/* Mobile Card View (responsive) */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/60 max-h-[75vh] overflow-y-auto">
                {filteredGroupStudents.map((student) => {
                  const attStats = getStudentAttendanceStats(student.id);
                  const feeStats = getStudentFeeStatus(student.id);
                  const parentPhoneClean = (student.parent_phone || student.phone || '').replace(/[^0-9]/g, '');
                  const formattedParentPhone = parentPhoneClean.startsWith('0') ? '2' + parentPhoneClean : parentPhoneClean;
                  
                  return (
                    <div key={student.id} className="p-3.5 space-y-3 bg-white dark:bg-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
                      {/* Top: Name & ID */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 dark:text-slate-50 text-sm flex items-center gap-2 flex-wrap">
                            <span className="whitespace-nowrap">{student.name}</span>
                            {attStats.absent >= 3 && (
                              <span className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0">
                                <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                                <span>غياب متكرر ({attStats.absent})</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono font-bold text-[#0D5C8C] bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
                              #{student.registration_id}
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans truncate">
                              الصف: {student.grade_level || selectedClassForStudents.grade_level}
                            </span>
                          </div>
                        </div>
                        <span className={\`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 \${
                          student.status === 'active' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800'
                        }\`}>
                          {student.status === 'active' ? 'نشط بالسنتر' : 'موقوف'}
                        </span>
                      </div>

                      {/* Middle: Attendance & Fees */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        {/* Attendance */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-slate-500">الحضور</span>
                            <span className={attStats.percentage >= 90 ? 'text-emerald-600' : attStats.percentage >= 75 ? 'text-amber-600' : 'text-rose-600'}>
                              {attStats.percentage}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={\`h-full rounded-full transition-all \${
                                attStats.percentage >= 90 ? 'bg-emerald-500' : attStats.percentage >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                              }\`}
                              style={{ width: \`\${attStats.percentage}%\` }}
                            />
                          </div>
                        </div>
                        {/* Fees */}
                        <div className="flex flex-col items-end justify-center">
                          {feeStats.isPaid ? (
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              <span>مسدد ({feeStats.totalAmount})</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>مستحق الشهر</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom: Contact & Actions */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/40">
                        {student.parent_phone ? (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={\`tel:\${student.parent_phone}\`}
                              className="flex items-center gap-1 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 px-2 py-1 rounded-lg hover:bg-slate-200 transition-colors"
                              dir="ltr"
                            >
                              <Phone className="w-3 h-3 text-[#0D5C8C]" />
                              {student.parent_phone}
                            </a>
                            {parentPhoneClean.length >= 10 && (
                              <a
                                href={\`https://wa.me/\${formattedParentPhone}?text=\${encodeURIComponent(\`السلام عليكم ورحمة الله وبركاته،\\nإلى ولي أمر: \${student.name}\\nتحية طيبة وبعد...\`)}\`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                                title="محادثة واتساب"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400">بدون هاتف</span>
                        )}
                        
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForReport(student)}
                            className="p-1.5 text-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:hover:bg-sky-900/40 rounded-lg transition-colors"
                            title="عرض الكشف الكامل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setTransferStudent(student);
                              setTargetClassIdForTransfer('');
                            }}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/40 rounded-lg transition-colors"
                            title="نقل لمجموعة أخرى"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingStudent(student)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/40 rounded-lg transition-colors"
                            title="تعديل البيانات"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              samsDb.softDeleteStudent(student.id);
                              loadData();
                              setSuccessText(\`تم نقل (\${student.name}) إلى الأرشيف بنجاح.\`);
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-lg transition-colors"
                            title="نقل إلى الأرشيف"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
`;
  
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully patched ClassesManager.tsx (mobile card actions)');
} else {
  console.error('mobileStartString or mobileEndString not found');
}
