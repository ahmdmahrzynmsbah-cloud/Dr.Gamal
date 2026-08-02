const fs = require('fs');
let content = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');

const targetState = `  const [printTargetReceipt, setPrintTargetReceipt] = useState<FeePayment | null>(null);`;
const newState = `  const [printTargetReceipt, setPrintTargetReceipt] = useState<FeePayment | null>(null);
  const [showPrintReportModal, setShowPrintReportModal] = useState(false);`;
content = content.replace(targetState, newState);

const targetTitle = `              <span className="text-[10px] bg-[#0D5C8C]/5 text-[#0D5C8C] px-3 py-1 rounded-full font-bold">الشهر المعروض: {selectedMonth}</span>
            </div>`;
const newTitle = `              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-[#0D5C8C]/5 text-[#0D5C8C] px-3 py-1 rounded-full font-bold">الشهر المعروض: {selectedMonth}</span>
                <button
                  onClick={() => setShowPrintReportModal(true)}
                  className="flex items-center gap-1 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الكشف</span>
                </button>
              </div>
            </div>`;
content = content.replace(targetTitle, newTitle);

fs.writeFileSync('src/components/FeesTracker.tsx', content, 'utf8');
console.log("Patched states and button");
