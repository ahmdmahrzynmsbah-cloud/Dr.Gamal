const fs = require('fs');
let content = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');

const startIdx = content.indexOf('<div className="flex justify-end gap-2 border-t border-slate-100 pt-3">');
const endIdx = content.indexOf('</button>\n              <button\n                type="button"\n                onClick={() => setSelectedReceipt(null)}', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = '<div className="flex justify-end gap-2 border-t border-slate-100 pt-3">\n' +
'              <button\n' +
'                type="button"\n' +
'                onClick={() => {\n' +
'                  handleProcessAction("جاري تجهيز الإيصال للطباعة...", () => {\n' +
'                    setPrintTargetReceipt(selectedReceipt);\n' +
'                    setShowPrintModal(true);\n' +
'                    setSelectedReceipt(null);\n' +
'                  });\n' +
'                }}\n' +
'                className="px-4 py-2 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5"\n' +
'              >\n' +
'                <Printer className="w-3.5 h-3.5" />\n' +
'                <span>أمر طباعة الإيصال الفوري</span>';
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync('src/components/FeesTracker.tsx', content, 'utf8');
}
