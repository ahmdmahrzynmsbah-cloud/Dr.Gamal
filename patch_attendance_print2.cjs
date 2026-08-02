const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

const targetPoint = `        </div>
      </div>
    </div>
  );
}`;

const printableSection = `
        </div>
      </div>

      {/* PRINTABLE ATTENDANCE SHEET */}
      <div id="printable-attendance-sheet" className="hidden print:block absolute inset-0 bg-white p-8 w-full h-full text-black">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-slate-800 pb-4 mb-6" dir="rtl">
          <div>
            <h1 className="text-2xl font-black text-slate-900">كشف غياب وحضور المجموعات</h1>
            <p className="text-sm font-bold text-slate-600 mt-1">تاريخ اليوم: {new Date(selectedDate).toLocaleDateString('ar-EG')}</p>
          </div>
          <div className="text-left">
            <div className="text-xl font-bold bg-slate-100 px-4 py-2 rounded-xl border border-slate-300">
              {selectedClass === 'all' ? 'جميع المجموعات' : classes.find(c => c.id === selectedClass)?.name}
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-right border-collapse" dir="rtl">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-800">
              <th className="py-3 px-4 font-bold text-slate-900">اسم الطالب</th>
              <th className="py-3 px-4 font-bold text-slate-900">كود الطالب</th>
              {selectedClass === 'all' && (
                <th className="py-3 px-4 font-bold text-slate-900">المجموعة</th>
              )}
              <th className="py-3 px-4 font-bold text-slate-900 text-center">حالة الحضور</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300">
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => {
                const studentAtt = attendance.find(a => a.student_id === student.id && a.date === selectedDate);
                const status = studentAtt ? studentAtt.status : 'pending';
                const classObj = classes.find(c => c.id === student.class_id);

                let statusText = 'لم يُسجل';
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
                );
              })
            ) : (
              <tr>
                <td colSpan={selectedClass === 'all' ? 4 : 3} className="py-8 text-center text-slate-500 font-bold">
                  لا يوجد طلاب في هذه المجموعة
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-12 flex justify-between border-t border-slate-300 pt-4" dir="rtl">
          <div className="text-sm font-bold text-slate-700">توقيع المدرس: ........................</div>
          <div className="text-sm font-bold text-slate-700">توقيع الإدارة: ........................</div>
        </div>
      </div>

    </div>
  );
}`;

if (content.includes(targetPoint)) {
    content = content.replace(targetPoint, printableSection);
    fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
    console.log("Patched AttendanceTracker.tsx");
} else {
    console.log("Could not find target point");
}
