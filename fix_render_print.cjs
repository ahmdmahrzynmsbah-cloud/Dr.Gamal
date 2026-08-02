const fs = require('fs');
let content = fs.readFileSync('src/components/ExamsAndAssignments.tsx', 'utf8');

const progressOverlayCode = `
      {/* Global Processing Progress Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            dir="rtl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-6"
            >
              <div className="w-16 h-16 bg-amber-50 rounded-2xl mx-auto flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                >
                  <RefreshCw className="w-8 h-8 text-amber-500" />
                </motion.div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800">{processingText}</h3>
                <p className="text-xs text-slate-500 font-sans">يرجى الانتظار، جاري معالجة البيانات...</p>
              </div>
              
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-amber-500"
                    initial={{ width: 0 }}
                    animate={{ width: \`\${processingProgress}%\` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-600 font-mono">
                  <span>{processingProgress}%</span>
                  <span>100%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;

const renderTarget = '  return (\n    <div className="space-y-6" id="sams_exams_module">';
const renderReplacement = `  if (showPrintModal && activeEvaluationObj) {
    const centerName = localStorage.getItem('sams_center_name') || 'المركز التعليمي التخصصي SAMS';
    const centerPhone = localStorage.getItem('sams_center_phone') || '';
    const centerLogo = localStorage.getItem('sams_center_logo') || '';
    const currentClass = classes.find(c => c.id === selectedClassId);
    const className = currentClass ? \`\${currentClass.name} (الصف: \${currentClass.grade_level})\` : 'المجموعة المحددة';
    
    // cast activeEvaluationObj to any to avoid type errors with name vs title
    const activeEval = activeEvaluationObj as any;
    const evalTitle = gradingType === 'exam' ? activeEval.name : activeEval.title;
    const maxScore = activeEval.max_score || 0;
    const termName = termFilter === 'first_term' ? 'الفصل الدراسي الأول' : 'الفصل الدراسي الثاني';
    const evalTypeLabel = gradingType === 'exam'
      ? ({ quiz: 'امتحان حصة', comprehensive: 'امتحان شامل', monthly: 'اختبار شهري', midterm: 'منتصف الفصل', final: 'اختبار نهائي' }[activeEval.type] || 'اختبار مخصص')
      : 'واجب دراسي يومي';
    const evalDate = gradingType === 'exam' ? activeEval.date : activeEval.due_date;

    let presentCount = 0;
    let absentCount = 0;
    let totalScoreSum = 0;
    let highestScore = 0;

    activeClassStudents.forEach(student => {
      const tempObj = tempGrades[student.id] || { score: 0, flag: false, notes: '' };
      const isAbsentOrMissing = gradingType === 'exam' ? tempObj.flag : !tempObj.flag;
      if (!isAbsentOrMissing) {
        presentCount++;
        totalScoreSum += tempObj.score;
        if (tempObj.score > highestScore) highestScore = tempObj.score;
      } else {
        absentCount++;
      }
    });

    const avgScore = presentCount > 0 ? (totalScoreSum / presentCount).toFixed(1) : '0';
    const avgPct = maxScore > 0 && presentCount > 0 ? Math.round((Number(avgScore) / maxScore) * 100) : 0;

    return (
      <div className="bg-white p-6 rounded-3xl animate-fade-in" dir="rtl">
        <div className="flex justify-between items-center mb-6 no-print border-b border-slate-100 pb-4">
          <button 
            onClick={() => setShowPrintModal(false)}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-2 font-bold text-sm cursor-pointer"
          >
            <X className="w-5 h-5" /> رجوع
          </button>
          <button 
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-slate-800 text-white hover:bg-slate-700 rounded-xl flex items-center gap-2 font-bold text-sm cursor-pointer shadow-md"
          >
            <Printer className="w-5 h-5" /> طباعة كشف الدرجات
          </button>
        </div>

        <div id="printable-group-roster" className="bg-white text-slate-900 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#0d5c8c] pb-4 mb-4">
            <div className="flex items-center gap-4">
              {centerLogo && <img src={centerLogo} alt="Logo" className="w-14 h-14 object-contain rounded-lg" />}
              <div>
                <h1 className="text-xl font-black text-[#0d5c8c]">{centerName}</h1>
                {centerPhone && <p className="text-xs text-slate-500 font-bold mt-1">هاتف: {centerPhone}</p>}
              </div>
            </div>
            <div className="text-left bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-black text-slate-800">{evalTitle}</h2>
              <p className="text-xs text-slate-500 font-bold mt-1">{evalTypeLabel} - {termName}</p>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl mb-4 text-sm">
            <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs">المجموعة</span><span className="font-black text-slate-900">{className}</span></div>
            <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs">تاريخ التقييم</span><span className="font-black text-slate-900">{evalDate}</span></div>
            <div className="flex flex-col gap-1"><span className="text-slate-500 text-xs">الدرجة النهائية</span><span className="font-black text-slate-900">{maxScore} درجة</span></div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            <div className="bg-slate-100 border border-slate-300 p-3 rounded-xl text-center flex flex-col">
              <span className="text-xl font-black text-[#0d5c8c]">{activeClassStudents.length}</span>
              <span className="text-[10px] font-bold text-slate-600 mt-1">إجمالي الطلاب</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center flex flex-col">
              <span className="text-xl font-black text-emerald-700">{presentCount}</span>
              <span className="text-[10px] font-bold text-emerald-600 mt-1">{gradingType === 'exam' ? 'الحضور' : 'المسلمين'}</span>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-center flex flex-col">
              <span className="text-xl font-black text-rose-700">{absentCount}</span>
              <span className="text-[10px] font-bold text-rose-600 mt-1">{gradingType === 'exam' ? 'الغياب' : 'لم يسلم'}</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center flex flex-col">
              <span className="text-xl font-black text-amber-700">{highestScore}</span>
              <span className="text-[10px] font-bold text-amber-600 mt-1">أعلى درجة</span>
            </div>
            <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl text-center flex flex-col">
              <span className="text-xl font-black text-sky-700">{avgScore} <span className="text-xs">({avgPct}%)</span></span>
              <span className="text-[10px] font-bold text-sky-600 mt-1">متوسط الدرجات</span>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-sm text-center border-collapse">
            <thead>
              <tr className="bg-[#0d5c8c] text-white">
                <th className="p-2 border border-slate-300">م</th>
                <th className="p-2 border border-slate-300">رقم القيد</th>
                <th className="p-2 border border-slate-300 text-right">اسم الطالب</th>
                <th className="p-2 border border-slate-300">الحالة</th>
                <th className="p-2 border border-slate-300">الدرجة</th>
                <th className="p-2 border border-slate-300">النسبة</th>
                <th className="p-2 border border-slate-300">التقدير</th>
                <th className="p-2 border border-slate-300">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {activeClassStudents.map((student, idx) => {
                const tempObj = tempGrades[student.id] || { score: 0, flag: false, notes: '' };
                const isAbsentOrMissing = gradingType === 'exam' ? tempObj.flag : !tempObj.flag;
                const pct = maxScore > 0 ? Math.round((tempObj.score / maxScore) * 100) : 0;
                let gradeLabel = 'ضعيف';
                if (!isAbsentOrMissing) {
                  if (pct >= 90) gradeLabel = 'ممتاز ✨';
                  else if (pct >= 80) gradeLabel = 'جيد جداً 👍';
                  else if (pct >= 65) gradeLabel = 'جيد';
                  else if (pct >= 50) gradeLabel = 'مقبول';
                } else {
                  gradeLabel = gradingType === 'exam' ? 'غائب 🔴' : 'لم يسلم ❌';
                }

                return (
                  <tr key={student.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2 border border-slate-300 font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold text-[#0d5c8c]">{student.registration_id}</td>
                    <td className="p-2 border border-slate-300 text-right font-bold text-slate-900">{student.name}</td>
                    <td className="p-2 border border-slate-300">
                      {isAbsentOrMissing 
                        ? <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-xs font-bold">{gradingType === 'exam' ? 'غائب' : 'لم يسلم'}</span>
                        : <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">{gradingType === 'exam' ? 'حاضر' : 'تم التسليم'}</span>
                      }
                    </td>
                    <td className="p-2 border border-slate-300 font-bold">
                      {isAbsentOrMissing ? '0' : tempObj.score} <span className="text-xs text-slate-400">/ {maxScore}</span>
                    </td>
                    <td className="p-2 border border-slate-300 font-bold" style={{ color: pct >= 80 ? '#16a34a' : pct >= 50 ? '#0284c7' : '#dc2626' }}>
                      {isAbsentOrMissing ? '0%' : pct + '%'}
                    </td>
                    <td className="p-2 border border-slate-300 font-bold">{gradeLabel}</td>
                    <td className="p-2 border border-slate-300 text-slate-500 text-xs">{tempObj.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 mt-12 text-center text-sm font-bold text-slate-800">
            <div>
              <p>أستاذ/معلم المادة</p>
              <p className="mt-8 text-slate-400 border-t border-dashed border-slate-300 pt-2 mx-4">التوقيع</p>
            </div>
            <div>
              <p>مشرف شؤون الامتحانات</p>
              <p className="mt-8 text-slate-400 border-t border-dashed border-slate-300 pt-2 mx-4">التوقيع</p>
            </div>
            <div>
              <p>اعتماد مدير المركز التعليمي</p>
              <p className="mt-8 text-slate-400 border-t border-dashed border-slate-300 pt-2 mx-4">الختم الرسمي</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in" id="sams_exams_module">
` + progressOverlayCode;

content = content.replace(renderTarget, renderReplacement);
fs.writeFileSync('src/components/ExamsAndAssignments.tsx', content, 'utf8');
console.log("Replaced render target with print component");
