const fs = require('fs');
let content = fs.readFileSync('src/components/StudentFullReport.tsx', 'utf8');

const oldTarget = `  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] print:p-0 print:bg-white print:block" dir="rtl">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col print:shadow-none print:max-w-full print:h-auto print:max-h-none print:overflow-visible"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0 print:bg-white print:border-slate-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#1A7FAA]/10 text-[#1A7FAA] rounded-xl flex items-center justify-center border border-[#1A7FAA]/20">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">التقرير الشامل للطالب</h2>
              <p className="text-sm text-slate-500 font-medium">{student.name} - {student.registration_id}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 print:hidden">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 font-bold text-sm transition-colors">
              <Printer className="w-4 h-4" />
              طباعة التقرير
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar print:p-4 print:space-y-6">`;

const newTarget = `  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-200 w-full flex flex-col print:shadow-none print:border-none print:bg-white animate-fade-in"
      dir="rtl"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-50 rounded-t-3xl shrink-0 gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl cursor-pointer border border-slate-200 transition-colors shadow-sm flex items-center gap-2"
            title="رجوع"
          >
             <X className="w-5 h-5" /><span className="font-bold text-sm">إغلاق التقرير</span>
          </button>
          <div className="w-12 h-12 bg-[#1A7FAA]/10 text-[#1A7FAA] rounded-xl flex items-center justify-center border border-[#1A7FAA]/20">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">التقرير الشامل للطالب</h2>
            <p className="text-sm text-slate-500 font-medium">{student.name} - {student.registration_id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={handlePrint} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 font-bold text-sm transition-colors shadow-md">
            <Printer className="w-4 h-4" />
            طباعة التقرير / PDF
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-8 print:p-0 print:space-y-6">`;

content = content.replace(oldTarget, newTarget);
fs.writeFileSync('src/components/StudentFullReport.tsx', content, 'utf8');
