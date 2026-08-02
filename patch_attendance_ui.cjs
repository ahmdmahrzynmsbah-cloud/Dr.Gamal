const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

const target = `          <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center mb-6">
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

const replacement = `          <div className="flex flex-col mb-6 space-y-4">
            <div className="flex justify-between items-start sm:items-center">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#1A7FAA] dark:text-sky-400 shrink-0" />
                مراجعة حضور المجموعات
              </h3>

              {selectedClass !== 'all' && (
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <button
                    onClick={markUnscannedAsAbsent}
                    className="h-9 px-3 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 hover:text-rose-700 border border-rose-200 dark:border-rose-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    غياب الباقي
                  </button>
                  <button
                    onClick={() => {
                      setTimeout(() => window.print(), 100);
                    }}
                    className="h-9 px-3 bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4 shrink-0" />
                    طباعة كشف المجموعة
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 h-10 px-3 w-full sm:w-auto shrink-0">
                <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 ml-2 shrink-0" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 select-none hidden md:inline-block ml-2">
                  {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'short' })}
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer p-0 m-0 w-full sm:w-[110px] outline-hidden text-left"
                  dir="ltr"
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg px-3 h-10 w-full sm:w-auto focus:border-[#1A7FAA] outline-hidden cursor-pointer shrink-0"
              >
                <option value="all">جميع المجموعات</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <div className="relative w-full sm:flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث عن طالب..."
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg pr-9 pl-3 h-10 text-xs focus:border-[#1A7FAA] outline-hidden text-slate-700 dark:text-slate-200 font-bold placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Mobile actions */}
            {selectedClass !== 'all' && (
              <div className="flex sm:hidden items-center gap-2 w-full">
                <button
                  onClick={markUnscannedAsAbsent}
                  className="h-10 flex-1 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 hover:text-rose-700 border border-rose-200 dark:border-rose-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  غياب الباقي
                </button>
                <button
                  onClick={() => {
                    setTimeout(() => window.print(), 100);
                  }}
                  className="h-10 flex-1 bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  طباعة الكشف
                </button>
              </div>
            )}
          </div>`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
    console.log("Patched AttendanceTracker.tsx");
} else {
    console.log("Target not found");
}

