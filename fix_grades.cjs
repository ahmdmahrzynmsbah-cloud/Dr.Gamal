const fs = require('fs');

let content = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');

const targetDropdown = `<select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedClass('all');
                }}
                className="w-full text-xs font-sans font-semibold border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-50/50 focus:bg-white dark:bg-slate-800 focus:outline-hidden"
              >
                {Array.from(new Set(classes.map(c => c.grade_level))).map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>`;

const newDropdown = `<select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedClass('all');
                }}
                className="w-full text-xs font-sans font-semibold border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-50/50 focus:bg-white dark:bg-slate-800 focus:outline-hidden"
              >
                <option value="">جميع الصفوف</option>
                <option value="الأول الإعدادي">الأول الإعدادي</option>
                <option value="الثاني الإعدادي">الثاني الإعدادي</option>
                <option value="الثالث الإعدادي">الثالث الإعدادي</option>
                <option value="الأول الثانوي">الأول الثانوي</option>
                <option value="الثاني الثانوي">الثاني الثانوي</option>
                <option value="الثالث الثانوي">الثالث الثانوي</option>
              </select>`;

if (content.includes(targetDropdown)) {
    content = content.replace(targetDropdown, newDropdown);
    fs.writeFileSync('src/components/FeesTracker.tsx', content, 'utf8');
    console.log("Patched grades dropdown in FeesTracker.");
} else {
    console.log("Target dropdown not found.");
}
