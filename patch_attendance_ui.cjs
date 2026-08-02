const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

const oldNoStudents = `<td colSpan={5} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                      لا يوجد طلاب في هذه المجموعة
                    </td>`;

const newNoStudents = `<td colSpan={5} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400 font-bold">
                      {selectedClass === '' ? 'يرجى اختيار المجموعة من الأعلى لعرض الطلاب' : 'لا يوجد طلاب في هذه المجموعة'}
                    </td>`;

if (content.includes(oldNoStudents)) {
    content = content.replace(oldNoStudents, newNoStudents);
    fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
    console.log("Patched successfully");
} else {
    console.log("Could not find the target");
}
