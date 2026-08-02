const fs = require('fs');

let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

const targetHeader = `<th className="py-3 px-4 font-bold text-slate-900 text-center">حالة الحضور</th>`;
const replaceHeader = `<th className="py-3 px-2 font-bold text-slate-900 text-center w-16">حاضر</th>
              <th className="py-3 px-2 font-bold text-slate-900 text-center w-16">غائب</th>
              <th className="py-3 px-2 font-bold text-slate-900 text-center w-16">مستأذن</th>`;

const targetRow = `let statusText = 'لم يُسجل';
                if (status === 'present') statusText = 'حاضر';
                if (status === 'absent') statusText = 'غائب';
                if (status === 'excused') statusText = 'مستأذن';

                return (
                  <tr key={student.id}>
                    <td className="py-3 px-4 font-bold text-slate-900">{student.name}</td>
                    <td className="py-3 px-4 text-slate-700 font-mono">{student.registration_id}</td>
                    {selectedClass === 'all' && (
                      <td className="py-3 px-4 text-slate-700">{classObj?.name || '-'}</td>
                    )}
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {statusText}
                    </td>
                  </tr>
                );`;

const replaceRow = `return (
                  <tr key={student.id}>
                    <td className="py-2 px-4 font-bold text-slate-900">{student.name}</td>
                    <td className="py-2 px-4 text-slate-700 font-mono">{student.registration_id}</td>
                    {selectedClass === 'all' && (
                      <td className="py-2 px-4 text-slate-700">{classObj?.name || '-'}</td>
                    )}
                    <td className="py-2 px-2 text-center align-middle">
                      <div className="w-5 h-5 border-[1.5px] border-slate-400 mx-auto rounded-sm flex items-center justify-center text-slate-900 font-bold">
                        {status === 'present' && '✓'}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center align-middle">
                      <div className="w-5 h-5 border-[1.5px] border-slate-400 mx-auto rounded-sm flex items-center justify-center text-slate-900 font-bold">
                        {status === 'absent' && '✓'}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center align-middle">
                      <div className="w-5 h-5 border-[1.5px] border-slate-400 mx-auto rounded-sm flex items-center justify-center text-slate-900 font-bold">
                        {status === 'excused' && '✓'}
                      </div>
                    </td>
                  </tr>
                );`;

const targetColspan = `<td colSpan={selectedClass === 'all' ? 4 : 3} className="py-8 text-center text-slate-500 font-bold">`;
const replaceColspan = `<td colSpan={selectedClass === 'all' ? 6 : 5} className="py-8 text-center text-slate-500 font-bold">`;

if (content.includes(targetHeader) && content.includes(targetRow)) {
    content = content.replace(targetHeader, replaceHeader);
    content = content.replace(targetRow, replaceRow);
    content = content.replace(targetColspan, replaceColspan);
    fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
    console.log("Patched AttendanceTracker.tsx");
} else {
    console.log("Could not find targets");
}
