const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

const targetHeader = `              <th className="py-3 px-4 font-bold text-slate-900">كود الطالب</th>
              
              <th className="py-3 px-2 font-bold text-slate-900 text-center w-16">حاضر</th>`;

const newHeader = `              <th className="py-3 px-4 font-bold text-slate-900">كود الطالب</th>
              <th className="py-3 px-4 font-bold text-slate-900 text-center w-24">اشتراك الشهر</th>
              <th className="py-3 px-2 font-bold text-slate-900 text-center w-16">حاضر</th>`;

content = content.replace(targetHeader, newHeader);

const targetRow = `                    <td className="py-2 px-4 text-slate-700 font-mono">{student.registration_id}</td>
                    
                    <td className="py-2 px-2 text-center align-middle">`;

const newRow = `                    <td className="py-2 px-4 text-slate-700 font-mono">{student.registration_id}</td>
                    <td className="py-2 px-4 text-center align-middle">
                      <div className="w-5 h-5 border-[1.5px] border-slate-400 mx-auto rounded-sm flex items-center justify-center"></div>
                    </td>
                    <td className="py-2 px-2 text-center align-middle">`;

content = content.replace(targetRow, newRow);

const targetFooter = `<div className="text-sm font-bold text-slate-700">توقيع المدرس: ........................</div>`;
const newFooter = `<div className="text-sm font-bold text-slate-700">توقيع السكرتارية: ........................</div>`;

content = content.replace(targetFooter, newFooter);

const targetColSpan = `<td colSpan={5} className="py-8 text-center text-slate-500 font-bold">`;
const newColSpan = `<td colSpan={6} className="py-8 text-center text-slate-500 font-bold">`;
content = content.replace(targetColSpan, newColSpan);


fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
console.log("Patched AttendanceTracker.tsx");
