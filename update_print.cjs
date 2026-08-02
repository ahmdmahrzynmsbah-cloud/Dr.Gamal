const fs = require('fs');

const file = 'src/components/ClassesManager.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the old print modal (from {/* Print Roster Modal */} to its </AnimatePresence>)
const oldModalStart = '        {/* Print Roster Modal */}\n        <AnimatePresence>\n          {showPrintRosterModal && (';
const oldModalEndStr = '          )}\n        </AnimatePresence>\n\n        {/* Archived Students Modal */}';

const startIndex = content.indexOf(oldModalStart);
if (startIndex !== -1) {
  const endIndex = content.indexOf(oldModalEndStr);
  if (endIndex !== -1) {
    content = content.substring(0, startIndex) + '        {/* Archived Students Modal */}' + content.substring(endIndex + oldModalEndStr.length);
  }
} else {
  console.log("Could not find old modal start.");
}

// 2. Read the print modal content
let printContent = fs.readFileSync('print_modal.txt', 'utf8');

// The original printContent is just the inner div content. 
// It starts with "{/* Top controls (hidden during print) */}" and ends with "</div>" (footer signature).
// Wait, it ends with:
//                  </div>
//                </div>

const replacementPrintContent = `
    if (showPrintRosterModal) {
      return (
        <div className="space-y-6 animate-fade-in bg-white p-6 rounded-3xl" id="print_roster_dedicated_page" dir="rtl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-4 gap-4 no-print">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowPrintRosterModal(false)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer ml-2"
                title="رجوع"
              >
                 <ArrowRight className="w-5 h-5" />
              </button>
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">معاينة وتصدير كشف المجموعة كـ PDF</h3>
                <p className="text-xs text-slate-500 font-sans">تنسيق طباعة رسمي بكافة بيانات طلاب المجموعة</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHeaderSettings(!showHeaderSettings)}
                className={\`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer \${
                  showHeaderSettings
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                }\`}
              >
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>تخصيص الشعار والترويسة 🎨</span>
                {showHeaderSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <Printer className="w-4 h-4 text-slate-950" />
                <span>طباعة الآن / حفظ كـ PDF</span>
              </button>
            </div>
          </div>
`;

// Extract everything from {/* Header & Logo Customization Panel (no-print) */} onwards from printContent
const headerCustomizationStart = '{/* Header & Logo Customization Panel (no-print) */}';
const headerIndex = printContent.indexOf(headerCustomizationStart);
let remainingPrintContent = '';
if (headerIndex !== -1) {
    remainingPrintContent = printContent.substring(headerIndex);
}

// Remove the last few closing tags from remainingPrintContent
// The original was inside <motion.div> and <div className="fixed ...">
const closingDivs = '\n              </motion.div>\n            </div>';
if (remainingPrintContent.endsWith(closingDivs)) {
    remainingPrintContent = remainingPrintContent.slice(0, -closingDivs.length);
}

const finalPrintView = replacementPrintContent + remainingPrintContent + '\n        </div>\n      );\n    }\n';

// 3. Insert finalPrintView just before "return (" in the selectedClassForStudents block
const returnTarget = '    return (\n      <div className="space-y-6 animate-fade-in" id="group_students_dedicated_page">';
const targetIndex = content.indexOf(returnTarget);
if (targetIndex !== -1) {
  content = content.substring(0, targetIndex) + finalPrintView + '\n' + content.substring(targetIndex);
} else {
  console.log("Could not find target return.");
}

fs.writeFileSync(file, content, 'utf8');
console.log("File updated!");
