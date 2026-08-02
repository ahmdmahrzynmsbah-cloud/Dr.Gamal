const fs = require('fs');
let content = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');

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

const renderTarget = '  return (\n    <div className="space-y-6" id="sams_fees_module" dir="rtl">';
const renderReplacement = `  if (showPrintModal && printTargetReceipt) {
    const studentInfo = students.find(s => s.id === printTargetReceipt.student_id);
    const centerName = localStorage.getItem('sams_center_name') || 'المركز التعليمي SAMS';
    const centerPhone = localStorage.getItem('sams_center_phone') || '';
    
    return (
      <div className="bg-white p-6 rounded-3xl animate-fade-in" dir="rtl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 no-print border-b border-slate-100 pb-4 gap-4">
          <button 
            onClick={() => {
              setShowPrintModal(false);
              setPrintTargetReceipt(null);
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-2 font-bold text-sm cursor-pointer"
          >
            <X className="w-5 h-5" /> رجوع
          </button>
          <button 
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-slate-800 text-white hover:bg-slate-700 rounded-xl flex items-center gap-2 font-bold text-sm cursor-pointer shadow-md w-full md:w-auto justify-center"
          >
            <Printer className="w-5 h-5" /> طباعة الإيصال
          </button>
        </div>

        <div id="printable-group-roster" className="bg-white w-full max-w-sm mx-auto shadow-md rounded-2xl border-2 border-slate-900 p-6 print:shadow-none print:border-2 print:max-w-none print:w-[320px]">
          <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
            <h2 className="text-xl font-black text-slate-900">{centerName}</h2>
            {centerPhone && <p className="text-sm font-bold text-slate-600 mt-1">هاتف: {centerPhone}</p>}
            <div className="mt-3 inline-block bg-slate-100 border border-slate-200 text-slate-800 font-black text-sm px-4 py-1.5 rounded-full shadow-sm">
              إيصال استلام نقدية
            </div>
          </div>

          <div className="space-y-3 text-sm font-bold text-slate-700 mb-6 font-sans">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">رقم الإيصال</span>
              <span className="font-mono text-slate-900 text-base">{printTargetReceipt.receipt_number}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">تاريخ السداد</span>
              <span>{printTargetReceipt.date}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">اسم الطالب</span>
              <span className="text-slate-900">{studentInfo ? studentInfo.name : 'طالب محذوف'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">رقم القيد</span>
              <span className="font-mono">{studentInfo ? studentInfo.registration_id : '-'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">نوع السداد</span>
              <span>
                {printTargetReceipt.category === 'tuition' 
                  ? 'اشتراك شهري'
                  : printTargetReceipt.category === 'book'
                  ? 'مذكرة دراسية'
                  : printTargetReceipt.category === 'exam'
                  ? 'رسوم امتحانات'
                  : 'رسوم أخرى'
                }
              </span>
            </div>
            {printTargetReceipt.category === 'tuition' && (
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">عن شهر</span>
                <span>{printTargetReceipt.month}</span>
              </div>
            )}
            <div className="flex justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="text-slate-500">المبلغ المدفوع</span>
              <span className="text-lg font-black text-slate-900">{printTargetReceipt.amount} ج.م</span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-slate-500">وسيلة المعاملة</span>
              <span className="font-semibold text-slate-700">
                {printTargetReceipt.payment_method === 'cash' ? 'نقدي (Cash)' : printTargetReceipt.payment_method === 'card' ? 'بطاقة POS' : 'Vodafone cash'}
              </span>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 font-bold border-t-2 border-dashed border-slate-300 pt-4 mt-2">
            تم استخراج هذا الإيصال إلكترونياً من نظام شؤون الطلاب.<br/>
            شكراً لثقتكم بالمركز التعليمي.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="sams_fees_module" dir="rtl">
` + progressOverlayCode;

content = content.replace(renderTarget, renderReplacement);
fs.writeFileSync('src/components/FeesTracker.tsx', content, 'utf8');
console.log("Replaced render target in FeesTracker with print component");
