const fs = require('fs');
let content = fs.readFileSync('src/components/StudentBarcodes.tsx', 'utf8');

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

const renderTarget = '  return (\n    <div className="space-y-6" dir="rtl">';
const renderReplacement = `  if (showPrintModal && printTargetStudents.length > 0) {
    return (
      <div className="bg-white p-6 rounded-3xl animate-fade-in" dir="rtl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 no-print border-b border-slate-100 pb-4 gap-4">
          <button 
            onClick={() => setShowPrintModal(false)}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-2 font-bold text-sm cursor-pointer"
          >
            <X className="w-5 h-5" /> رجوع
          </button>
          <button 
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-slate-800 text-white hover:bg-slate-700 rounded-xl flex items-center gap-2 font-bold text-sm cursor-pointer shadow-md w-full md:w-auto justify-center"
          >
            <Printer className="w-5 h-5" /> طباعة الملصقات / حفظ PDF
          </button>
        </div>

        <div id="printable-group-roster" className="bg-white">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 p-4 print:grid-cols-3 print:gap-4 print:p-0">
            {printTargetStudents.map(student => {
              const classroom = classes.find(c => c.id === student.class_id);
              return (
                <div key={student.id} className="border-2 border-slate-800 rounded-xl p-4 flex flex-col items-center text-center page-break-inside-avoid shadow-sm print:shadow-none bg-white">
                  <h3 className="font-black text-slate-900 text-lg mb-1 border-b-2 border-slate-800 pb-2 w-full">الدكتور في اللغة العربية</h3>
                  <div className="w-full mt-2 mb-3">
                    <p className="font-black text-slate-900 text-base">{student.name}</p>
                    <p className="text-xs font-bold text-slate-700 mt-1">المجموعة: {classroom?.name || 'غير محدد'}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">
                      {classroom?.schedule_days || 'غير محدد'} | {classroom?.schedule_time ? \`الساعة \${classroom.schedule_time}\` : 'غير محدد'}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-white p-2 border border-slate-200 rounded-lg w-full">
                    <Barcode 
                      value={student.registration_id} 
                      width={1.5} 
                      height={40} 
                      fontSize={11} 
                      margin={0} 
                      displayValue={true} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
` + progressOverlayCode;

content = content.replace(renderTarget, renderReplacement);
fs.writeFileSync('src/components/StudentBarcodes.tsx', content, 'utf8');
console.log("Replaced render target in Barcodes with print component");
