const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');

const archiveModalBlock = `      {/* Archived Students Modal */}
      <AnimatePresence>
        {showArchiveModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl max-w-3xl w-full p-6 text-right space-y-5 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 dark:border-slate-700 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-800 dark:text-amber-300 rounded-2xl">
                    <Archive className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-slate-50 dark:text-slate-50 text-base">أرشيف الطلاب المؤرشفين</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400 font-sans">إدارة واستعادة أو حذف بيانات الطلاب الموجودين في الأرشيف</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowArchiveModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                <input
                  type="text"
                  value={archivedSearchTerm}
                  onChange={(e) => setArchivedSearchTerm(e.target.value)}
                  placeholder="بحث في الطلاب المؤرشفين بالاسم أو رقم القيد..."
                  className="w-full bg-slate-50 dark:bg-slate-900/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl pr-10 pl-4 py-2 text-xs focus:outline-none focus:border-amber-600 font-sans"
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
                      <div className="text-center py-12 text-slate-400 space-y-2">
                        <Archive className="w-10 h-10 mx-auto text-slate-300" />
                        <p className="text-xs font-bold">لا يوجد طلاب في الأرشيف حالياً</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {archivedList.map(st => (
                        <div key={st.id} className="p-3.5 bg-slate-50 dark:bg-slate-900/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-slate-50 dark:text-slate-50 text-xs">{st.name}</span>
                              <span className="text-[10px] bg-amber-100 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md font-mono font-bold">
                                {st.registration_id}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-400 mt-1 flex flex-wrap gap-3">
                              <span>الصف: {st.grade_level}</span>
                              <span>الهاتف: {st.phone || st.parent_phone || '-'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Restore */}
                            <button
                              type="button"
                              onClick={() => {
                                samsDb.restoreStudent(st.id);
                                loadData();
                                setSuccessMessage(\`تمت استعادة الطالب (\${st.name}) بنجاح وإعادته للقائمة النشطة.\`);
                              }}
                              className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                              <span>استعادة الطالب</span>
                            </button>

                            {/* Permanent Delete */}
                            <button
                              type="button"
                              onClick={() => setArchivedStudentToPermanentDelete(st)}
                              className="px-3 py-1.5 bg-rose-50 dark:bg-rose-900/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                              <span>حذف نهائي</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>`;

// Remove the old block
if (!content.includes(archiveModalBlock)) {
    console.log("Archive block not found. Checking exactly");
} else {
    content = content.replace(archiveModalBlock, '');
}

const earlyReturnBlock = `
  if (showArchiveModal) {
    return (
      <div className="space-y-6 animate-fade-in" dir="rtl">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowArchiveModal(false)}
              className="p-2.5 bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
              title="رجوع"
            >
              <X className="w-5 h-5" />
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

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[70vh]">
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                </div>
              );
            })()}
          </div>
        </div>
        
        {/* Global Processing Progress Overlay and Modals should still be accessible if needed */}
        <AnimatePresence>
          {archivedStudentToPermanentDelete && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] animate-fade-in" dir="rtl">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl max-w-md w-full p-6 text-right space-y-4"
              >
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                  <div className="w-10 h-10 bg-red-50 dark:bg-red-900/40 rounded-full flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">تأكيد الحذف النهائي</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">هذا الإجراء لا يمكن التراجع عنه.</p>
                  </div>
                </div>
                
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  هل أنت متأكد من رغبتك في الحذف النهائي للطالب <span className="font-bold">({archivedStudentToPermanentDelete?.name})</span>؟ سيتم مسح كافة سجلاته بشكل دائم.
                </p>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setArchivedStudentToPermanentDelete(null)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (archivedStudentToPermanentDelete) {
                        handleProcessAction("جاري الحذف النهائي...", () => {
                          samsDb.permanentlyDeleteStudent(archivedStudentToPermanentDelete.id);
                          setSuccessMessage('تم حذف الطالب نهائياً بنجاح.');
                          setArchivedStudentToPermanentDelete(null);
                          loadData();
                        });
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-sm shadow-red-200 dark:shadow-none"
                  >
                    <Trash2 className="w-4 h-4" />
                    تأكيد الحذف النهائي 🗑️
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }
`;

const targetInsertionPoint = `  if (showFullReport && selectedProfile) {`;
content = content.replace(targetInsertionPoint, earlyReturnBlock + '\n' + targetInsertionPoint);

fs.writeFileSync('src/components/StudentsList.tsx', content, 'utf8');

