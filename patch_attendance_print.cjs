const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

if (!content.includes('import { Printer')) {
    content = content.replace('import { CheckCheck', 'import { CheckCheck, Printer');
}

const targetLayout = `          <div className="flex flex-col 2xl:flex-row gap-4 justify-between items-start 2xl:items-center mb-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 shrink-0 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#1A7FAA] dark:text-sky-400" />
              مراجعة حضور المجموعات
            </h3>
            
            <div className="flex flex-wrap items-center justify-end gap-2 w-full 2xl:w-auto">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 h-9">
                <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 mr-2 shrink-0" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 select-none hidden md:inline-block">
                  {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'short' })}
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer py-0 px-2 m-0 w-[110px] shrink-0 outline-hidden"
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg px-2 py-0 h-9 focus:border-[#1A7FAA] focus:ring-1 focus:ring-[#1A7FAA] outline-hidden cursor-pointer shrink-0 max-w-[130px] truncate"
              >
                <option value="all">جميع المجموعات</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <div className="relative shrink-0 flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث عن طالب..."
                  className="w-full sm:w-[140px] bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg pr-8 pl-2 h-9 text-xs focus:border-[#1A7FAA] focus:ring-1 focus:ring-[#1A7FAA] outline-hidden text-slate-700 dark:text-slate-200 font-bold placeholder:text-slate-400"
                />
              </div>

              {selectedClass !== 'all' && (
                <button
                  onClick={markUnscannedAsAbsent}
                  className="px-3 py-0 h-9 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 hover:text-rose-700 border border-rose-200 dark:border-rose-700 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0"
                  title="تسجيل الغياب لمن لم يحضر (بالمجموعة)"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline-block">غياب الباقي</span>
                </button>
              )}
            </div>
          </div>`;

const replacementLayout = `          <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center mb-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 shrink-0 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#1A7FAA] dark:text-sky-400" />
              مراجعة حضور المجموعات
            </h3>
            
            <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto xl:justify-end">
              
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 h-9 px-2 shrink-0">
                <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 ml-1 shrink-0" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 select-none hidden sm:inline-block ml-1">
                  {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'short' })}
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer p-0 m-0 w-[100px] outline-hidden text-left"
                  dir="ltr"
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg px-2 h-9 focus:border-[#1A7FAA] outline-hidden cursor-pointer shrink-0 min-w-[120px]"
              >
                <option value="all">جميع المجموعات</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <div className="relative shrink-0 flex-1 min-w-[100px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث..."
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg pr-8 pl-2 h-9 text-xs focus:border-[#1A7FAA] outline-hidden text-slate-700 dark:text-slate-200 font-bold placeholder:text-slate-400"
                />
              </div>

              {selectedClass !== 'all' && (
                <>
                  <button
                    onClick={markUnscannedAsAbsent}
                    className="h-9 px-3 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 hover:text-rose-700 border border-rose-200 dark:border-rose-700 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0"
                    title="تسجيل الغياب لمن لم يحضر"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline-block">غياب الباقي</span>
                  </button>
                  <button
                    onClick={() => {
                      setTimeout(() => window.print(), 100);
                    }}
                    className="h-9 px-3 bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-700 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline-block">طباعة كشف غياب</span>
                  </button>
                </>
              )}
            </div>
          </div>`;

content = content.replace(targetLayout, replacementLayout);

// Now append the printable sheet to the end of the component (just before the last closing div/motion.div)
const printableSheetTarget = `    </motion.div>
  );
}`;

const printableSheetStr = `      {/* PRINTABLE ATTENDANCE SHEET AREA */}
      {selectedClass !== 'all' && (
        <div id="printable-attendance-sheet" className="hidden print:block space-y-6 bg-white p-6 w-full" dir="rtl">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
            <div className="flex items-center gap-4">
              {localStorage.getItem('sams_custom_app_logo_v2') ? (
                <img src={localStorage.getItem('sams_custom_app_logo_v2')!} alt="شعار السنتر" className="w-16 h-16 object-contain rounded-xl border border-slate-200 bg-slate-50 shrink-0" />
              ) : (
                <div className="w-14 h-14 bg-amber-500/10 border-2 border-amber-600 rounded-xl flex items-center justify-center text-amber-800 font-extrabold text-2xl shrink-0">
                  {localStorage.getItem('sams_custom_header_title_v2') ? localStorage.getItem('sams_custom_header_title_v2')!.charAt(0) : 'س'}
                </div>
              )}
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 leading-tight">{localStorage.getItem('sams_custom_header_title_v2') || 'سنتر التعليم والتفوق'}</h1>
                <p className="text-xs text-slate-600 font-medium mt-0.5">{localStorage.getItem('sams_custom_header_subtitle_v2') || 'كشف حضور وغياب المجموعة'}</p>
                {localStorage.getItem('sams_custom_header_contact_v2') && <p className="text-[11px] text-slate-500 font-sans mt-0.5">{localStorage.getItem('sams_custom_header_contact_v2')}</p>}
              </div>
            </div>

            <div className="text-center px-6 py-2 bg-slate-50 border border-slate-300 rounded-xl shrink-0">
              <span className="text-sm font-bold text-slate-800 block mb-1">تاريخ الحصة</span>
              <span className="text-xs font-mono font-bold text-slate-900">{new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Group details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-sans">
            <div>
              <span className="text-slate-500 block text-[10px]">اسم المجموعة:</span>
              <strong className="text-slate-900 font-bold text-sm">{classes.find(c => c.id === selectedClass)?.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">الصف الدراسي:</span>
              <strong className="text-slate-900 font-bold text-sm">{classes.find(c => c.id === selectedClass)?.grade_level}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">المواعيد:</span>
              <strong className="text-slate-900 font-bold text-sm">{classes.find(c => c.id === selectedClass)?.schedule_days} - {classes.find(c => c.id === selectedClass)?.schedule_time}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">العدد الكلي:</span>
              <strong className="text-amber-700 font-bold text-sm">{students.filter(s => s.class_id === selectedClass).length} طالب</strong>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-right border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-900 font-extrabold border-b border-slate-300">
                <th className="p-3 border border-slate-300 text-center w-12">م</th>
                <th className="p-3 border border-slate-300 w-24">رقم القيد</th>
                <th className="p-3 border border-slate-300">اسم الطالب</th>
                <th className="p-3 border border-slate-300 w-28 text-center">حضور</th>
                <th className="p-3 border border-slate-300 w-28 text-center">غياب</th>
                <th className="p-3 border border-slate-300 w-48 text-center">ملاحظات (واجب/تسميع)</th>
              </tr>
            </thead>
            <tbody>
              {students.filter(s => s.class_id === selectedClass).map((st, idx) => (
                <tr key={st.id} className="border-b border-slate-200">
                  <td className="p-3 border border-slate-300 text-center font-bold text-slate-700">{idx + 1}</td>
                  <td className="p-3 border border-slate-300 font-mono font-bold text-slate-800">{st.registration_id}</td>
                  <td className="p-3 border border-slate-300 font-bold text-slate-900 text-sm">{st.name}</td>
                  <td className="p-3 border border-slate-300"></td>
                  <td className="p-3 border border-slate-300"></td>
                  <td className="p-3 border border-slate-300"></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer signature */}
          <div className="pt-8 flex justify-between items-center text-sm font-bold text-slate-700 border-t border-slate-300 font-sans mt-8">
            <div>توقيع أخصائي شؤون الطلاب: ....................................</div>
            <div>توقيع المعلم: ....................................</div>
          </div>
        </div>
      )}
    </motion.div>
  );
}`;

content = content.replace(printableSheetTarget, printableSheetStr);
fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
console.log("Patched AttendanceTracker layout and print view.");
