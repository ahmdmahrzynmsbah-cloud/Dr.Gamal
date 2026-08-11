const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

const targetUI = `      </div>
      </div>
{/* PRINTABLE ATTENDANCE SHEET */}`;

const replacementUI = `      </div>
      </div>

      {/* SMS/WhatsApp Direct Send Modal */}
      {selectedAbsentStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-2xl max-w-lg w-full space-y-4 animate-slide-up text-right">
            
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-black text-[#0D5C8C] text-sm flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                إرسال تنبيه غياب لولي الأمر
              </h3>
              <button 
                 onClick={() => { setSelectedAbsentStudent(null); setMsgFeedback(null); }}
                 className="text-slate-400 font-bold hover:text-slate-600 dark:text-slate-300 text-xs px-2 cursor-pointer"
              >
                إغلاق 
              </button>
            </div>

            {/* Receiver Info Banner */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">ولي الأمر المستهدف</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{selectedAbsentStudent.parent_name || 'ولي أمر الطالب'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الطالب المستهدف</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{selectedAbsentStudent.name}</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-gray-100 dark:border-gray-700">
                <span className="text-slate-400 text-[10px] inline-block ml-1">رقم الإرسال:</span>
                <span className="font-mono text-slate-600 dark:text-slate-300 mr-1 font-bold">{selectedAbsentStudent.parent_phone || selectedAbsentStudent.phone || 'دون رقم'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">نص الرسالة الموجهة:</label>
              <textarea
                value={absentMessage}
                onChange={(e) => setAbsentMessage(e.target.value)}
                rows={4}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-indigo-400 font-medium text-slate-700 dark:text-slate-200 leading-relaxed shadow-inner"
              />
            </div>
            
            {msgFeedback && (
              <div className={\`p-3 rounded-lg text-xs font-bold flex items-center gap-1.5 \${msgFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}\`}>
                {msgFeedback.type === 'success' ? <Check className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                {msgFeedback.text}
              </div>
            )}

            <button
              onClick={sendAbsenceMsg}
              className="w-full flex items-center justify-center gap-2 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white py-3 px-4 rounded-xl font-black transition-all active:scale-[0.98] cursor-pointer text-sm shadow-md"
            >
              <Send className="w-4 h-4" />
              إرسال الرسالة الآن
            </button>
          </div>
        </div>
      )}

{/* PRINTABLE ATTENDANCE SHEET */}`;

code = code.replace(targetUI, replacementUI);
fs.writeFileSync('src/components/AttendanceTracker.tsx', code);
