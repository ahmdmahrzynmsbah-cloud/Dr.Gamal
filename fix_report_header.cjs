const fs = require('fs');
let content = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');

const targetHeader = `<div className="text-left mb-4">
            <div className="text-xl font-bold bg-slate-100 px-4 py-2 rounded-xl border border-slate-300 inline-block">
              المجموعة: {classes.find(c => c.id === selectedClass)?.name || selectedGrade}
            </div>
          </div>`;

const newHeader = `<div className="flex justify-between items-center mb-4">
            <div className="text-xl font-bold bg-slate-100 px-4 py-2 rounded-xl border border-slate-300 inline-block">
              المجموعة: {classes.find(c => c.id === selectedClass)?.name || selectedGrade}
            </div>
            <div className="text-2xl font-black text-slate-800">
              {localStorage.getItem('sams_center_name') || 'الدكتور في اللغة العربية'}
            </div>
          </div>`;

if (content.includes(targetHeader)) {
    content = content.replace(targetHeader, newHeader);
    fs.writeFileSync('src/components/FeesTracker.tsx', content, 'utf8');
    console.log("Patched header in FeesTracker.");
} else {
    console.log("Target header not found.");
}
