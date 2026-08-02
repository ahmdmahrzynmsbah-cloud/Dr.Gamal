const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

const target = `          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#1A7FAA] dark:text-sky-400" />
              مراجعة حضور المجموعات
            </h3>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 mx-1" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 select-none">
                  {new Date(selectedDate).toLocaleDateString('ar-EG', { weekday: 'long' })}
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-0 cursor-pointer p-0 m-0"
                />
              </div>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg px-3 py-2 focus:border-[#1A7FAA] focus:ring-1 focus:ring-[#1A7FAA] outline-hidden cursor-pointer"
              >
                <option value="all">جميع المجموعات</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث عن طالب..."
                  className="w-48 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg pr-9 pl-3 py-2 text-xs focus:border-[#1A7FAA] focus:ring-1 focus:ring-[#1A7FAA] outline-hidden text-slate-700 dark:text-slate-200 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Filters & Actions */}
          {selectedClass !== 'all' && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={markUnscannedAsAbsent}
                className="px-4 py-2 bg-rose-50 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 hover:text-rose-700 border border-rose-200 dark:border-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                تسجيل الغياب لمن لم يحضر (بالمجموعة)
              </button>
            </div>
          )}`;

const replacement = `          <div className="flex flex-col 2xl:flex-row gap-4 justify-between items-start 2xl:items-center mb-6">
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

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
  console.log("Successfully replaced layout.");
} else {
  console.log("Target not found!");
}
