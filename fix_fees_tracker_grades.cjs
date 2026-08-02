const fs = require('fs');
let content = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');

const targetSelect = `              <select
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

const newSelect = `              <select
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedClass('all');
                }}
                className="w-full text-xs font-sans font-semibold border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-slate-50/50 focus:bg-white dark:bg-slate-800 focus:outline-hidden"
              >
                {['الأول الإعدادي', 'الثاني الإعدادي', 'الثالث الإعدادي', 'الأول الثانوي', 'الثاني الثانوي', 'الثالث الثانوي'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>`;

if (content.includes(targetSelect)) {
    content = content.replace(targetSelect, newSelect);
    fs.writeFileSync('src/components/FeesTracker.tsx', content, 'utf8');
    console.log("Patched grades selector.");
} else {
    console.log("Target select not found.");
}
