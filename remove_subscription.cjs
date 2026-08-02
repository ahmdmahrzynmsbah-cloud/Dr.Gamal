const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

const targetHeader = `<th className="py-3 px-4 font-bold text-slate-900 text-center w-24">اشتراك الشهر</th>`;
content = content.replace(targetHeader + '\n', '');
content = content.replace(targetHeader, '');

const targetCell = `                    <td className="py-2 px-4 text-center align-middle">
                      <div className="w-5 h-5 border-[1.5px] border-slate-400 mx-auto rounded-sm flex items-center justify-center"></div>
                    </td>`;
content = content.replace(new RegExp(targetCell.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\n?', 'g'), '');

content = content.replace(/colSpan=\{6\}/g, "colSpan={5}");

fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
console.log("Patched AttendanceTracker.tsx");
