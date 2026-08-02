const fs = require('fs');
let content = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');

const reportUI = `
  if (showPrintReportModal) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl animate-fade-in" dir="rtl">
        <div className="flex justify-between items-center mb-6 no-print border-b border-slate-100 dark:border-slate-700 pb-4">
          <button
            onClick={() => setShowPrintReportModal(false)}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl flex items-center gap-2 font-bold text-sm cursor-pointer"
          >
            <ArrowLeftRight className="w-5 h-5" />
            رجوع
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white rounded-xl font-bold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Printer className="w-5 h-5" />
            طباعة الكشف
          </button>
        </div>

        {/* Printable Area */}
        <div className="print-area max-w-4xl mx-auto p-4 bg-white text-black border border-slate-200" dir="rtl">
          <div className="text-center mb-6 border-b-2 border-slate-800 pb-4">
            <h1 className="text-2xl font-black text-slate-900">كشف سداد الاشتراكات الشهرية</h1>
            <p className="text-sm font-bold text-slate-600 mt-1">عن شهر: {selectedMonth}</p>
          </div>
          
          <div className="text-left mb-4">
            <div className="text-xl font-bold bg-slate-100 px-4 py-2 rounded-xl border border-slate-300 inline-block">
              المجموعة: {classes.find(c => c.id === selectedClass)?.name || selectedGrade}
            </div>
          </div>

          <table className="w-full text-right border-collapse" dir="rtl">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-800">
                <th className="py-3 px-4 font-bold text-slate-900 border border-slate-300">م</th>
                <th className="py-3 px-4 font-bold text-slate-900 border border-slate-300">اسم الطالب</th>
                <th className="py-3 px-4 font-bold text-slate-900 border border-slate-300">كود الطالب</th>
                <th className="py-3 px-4 font-bold text-slate-900 border border-slate-300 text-center">حالة السداد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {filteredClassStudents.length > 0 ? (
                filteredClassStudents.map((student, idx) => {
                  const currentMonthPayment = payments.find(
                    p => p.student_id === student.id &&
                          p.category === 'tuition' &&
                          p.month === selectedMonth
                  );
                  const isPaid = !!currentMonthPayment;

                  return (
                    <tr key={student.id}>
                      <td className="py-2 px-4 font-bold text-slate-900 border border-slate-300">{idx + 1}</td>
                      <td className="py-2 px-4 font-bold text-slate-900 border border-slate-300">{student.name}</td>
                      <td className="py-2 px-4 text-slate-700 font-mono border border-slate-300">{student.registration_id}</td>
                      <td className="py-2 px-4 border border-slate-300">
                        {isPaid ? (
                          <div className="text-center font-bold text-slate-700">مدفوع</div>
                        ) : (
                          <div className="flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700">دفع</span>
                              <div className="w-5 h-5 border-[1.5px] border-slate-400 rounded-sm"></div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700">لم يدفع</span>
                              <div className="w-5 h-5 border-[1.5px] border-slate-400 rounded-sm"></div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 font-bold border border-slate-300">
                    لا يوجد طلاب في هذه المجموعة
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-12 flex justify-between border-t border-slate-300 pt-4" dir="rtl">
            <div className="text-sm font-bold text-slate-700">توقيع السكرتارية: ........................</div>
            <div className="text-sm font-bold text-slate-700">توقيع الإدارة: ........................</div>
          </div>
        </div>
      </div>
    );
  }

  if (showPrintModal && printTargetReceipt) {`;

content = content.replace("  if (showPrintModal && printTargetReceipt) {", reportUI);
fs.writeFileSync('src/components/FeesTracker.tsx', content, 'utf8');
console.log("Report Modal Injected.");
