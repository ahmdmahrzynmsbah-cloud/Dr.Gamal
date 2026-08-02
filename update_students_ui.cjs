const fs = require('fs');

const file = 'src/components/StudentsList.tsx';
let content = fs.readFileSync(file, 'utf8');

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

const mainRenderTarget = '  return (\n    <motion.div ';
const mainRenderReplacement = '  return (\n    <motion.div>\n' + progressOverlayCode + '\n      <motion.div ';

content = content.replace(mainRenderTarget, mainRenderReplacement);
fs.writeFileSync(file, content, 'utf8');
console.log("Updated UI for StudentsList.");
