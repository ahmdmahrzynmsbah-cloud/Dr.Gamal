const fs = require('fs');
const path = './src/components/ClassesManager.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetContent = `        {/* Filter and Search Bar */}
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_left,black_90%,transparent_100%)]">
          <div className="bg-white dark:bg-slate-800 p-2 sm:p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="relative min-w-[280px] whitespace-nowrap flex-shrink-0 select-none flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                placeholder="ابحث باسم الطالب، رقم القيد، أو هاتف ولي الأمر..."
                className="w-full text-xs font-sans border border-slate-200 dark:border-slate-700 pr-9 pl-3 h-10 rounded-xl focus:outline-hidden focus:border-[#0D5C8C]"
              />
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap flex-shrink-0 select-none">
              <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 font-bold ml-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>تصفية النتائج:</span>
              </div>
              <select
                value={studentStatusFilter}
                onChange={(e) => setStudentStatusFilter(e.target.value as any)}
                className="whitespace-nowrap flex-shrink-0 select-none text-xs font-sans border border-slate-200 dark:border-slate-700 px-3 h-10 rounded-xl focus:outline-hidden focus:border-[#0D5C8C] bg-white dark:bg-slate-800 cursor-pointer"
              >
                <option value="all">جميع الحالات (نشط وموقوف)</option>
                <option value="active">الطلاب النشطون فقط</option>
                <option value="inactive">الطلاب الموقوفون فقط</option>
              </select>
              <select
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value as any)}
                className="whitespace-nowrap flex-shrink-0 select-none text-xs font-sans border border-slate-200 dark:border-slate-700 px-3 h-10 rounded-xl focus:outline-hidden focus:border-[#0D5C8C] bg-white dark:bg-slate-800 cursor-pointer"
              >
                <option value="all">جميع معدلات الحضور</option>
                <option value="excellent">انضباط ممتاز (≥90%)</option>
                <option value="warning">إنذار غياب متكرر (≥3 غيابات) ⚠️</option>
              </select>
            </div>
          </div>
        </div>`;

const newContent = `        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-800 p-2 sm:p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs flex flex-col md:flex-row flex-wrap items-center gap-3 w-full">
          <div className="relative w-full md:flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
              placeholder="ابحث باسم الطالب، رقم القيد، أو هاتف ولي الأمر..."
              className="w-full text-xs font-sans border border-slate-200 dark:border-slate-700 pr-9 pl-3 h-10 rounded-xl focus:outline-hidden focus:border-[#0D5C8C]"
            />
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 font-bold ml-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>تصفية النتائج:</span>
            </div>
            <select
              value={studentStatusFilter}
              onChange={(e) => setStudentStatusFilter(e.target.value as any)}
              className="w-full sm:w-auto text-xs font-sans border border-slate-200 dark:border-slate-700 px-3 h-10 rounded-xl focus:outline-hidden focus:border-[#0D5C8C] bg-white dark:bg-slate-800 cursor-pointer"
            >
              <option value="all">جميع الحالات (نشط وموقوف)</option>
              <option value="active">الطلاب النشطون فقط</option>
              <option value="inactive">الطلاب الموقوفون فقط</option>
            </select>
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value as any)}
              className="w-full sm:w-auto text-xs font-sans border border-slate-200 dark:border-slate-700 px-3 h-10 rounded-xl focus:outline-hidden focus:border-[#0D5C8C] bg-white dark:bg-slate-800 cursor-pointer"
            >
              <option value="all">جميع معدلات الحضور</option>
              <option value="excellent">انضباط ممتاز (≥90%)</option>
              <option value="warning">إنذار غياب متكرر (≥3 غيابات) ⚠️</option>
            </select>
          </div>
        </div>`;

if (content.includes(targetContent)) {
  content = content.replace(targetContent, newContent);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Success');
} else {
  console.log('Target content not found.');
}
