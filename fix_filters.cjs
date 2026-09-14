const fs = require('fs');

const path = './src/components/StudentsList.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetFiltersStart = '        <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full no-scrollbar mask-edges">';
const targetFiltersEnd = '        </div>\n      </div>\n\n      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">';

let startIndex = content.indexOf(targetFiltersStart);
let endIndex = content.indexOf('      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100', startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find filters block.");
  process.exit(1);
}

const newFiltersSection = `        <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full no-scrollbar">
          {/* Main Filter Icon */}
          <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </div>

          <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="shrink-0 min-w-max bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer">
            <option value="all">كل المجموعات (الكل)</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.grade_level} - {c.education_type || 'عام'})</option>)}
          </select>
          
          <select value={gradeLevelFilter} onChange={e => setGradeLevelFilter(e.target.value)} className="shrink-0 min-w-max bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer">
            <option value="all">كل الصفوف الدراسية</option>
            <option value="الأول الإعدادي">الأول الإعدادي</option>
            <option value="الثاني الإعدادي">الثاني الإعدادي</option>
            <option value="الثالث الإعدادي">الثالث الإعدادي</option>
            <option value="الأول الثانوي">الأول الثانوي</option>
            <option value="الثاني الثانوي">الثاني الثانوي</option>
            <option value="الثالث الثانوي">الثالث الثانوي</option>
          </select>

          <select value={educationTypeFilter} onChange={e => setEducationTypeFilter(e.target.value)} className="shrink-0 min-w-max bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer">
            <option value="all">التعليم (عام / أزهر)</option>
            <option value="عام">عام</option>
            <option value="أزهر">أزهر</option>
          </select>

          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="shrink-0 min-w-max bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer">
            <option value="all">الحالة (مفعل / غير مفعل)</option>
            <option value="active">المنتظمون فقط (مفعل)</option>
            <option value="inactive">المجمدون فقط (غير مفعل)</option>
          </select>
        </div>
      </div>

`;

content = content.substring(0, startIndex) + newFiltersSection + content.substring(endIndex);
fs.writeFileSync(path, content, 'utf8');
console.log('Fixed filters layout');

