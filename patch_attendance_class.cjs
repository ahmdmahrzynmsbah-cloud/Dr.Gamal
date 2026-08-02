const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

// Change default state
content = content.replace("const [selectedClass, setSelectedClass] = useState('all');", "const [selectedClass, setSelectedClass] = useState('');");

// Change filteredStudents
const oldFiltered = `  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesClass = selectedClass === 'all' || s.class_id === selectedClass;
      const matchesSearch = !searchTerm || s.name.includes(searchTerm) || s.registration_id.includes(searchTerm);
      return matchesClass && matchesSearch;
    });
  }, [students, selectedClass, searchTerm]);`;

const newFiltered = `  const filteredStudents = useMemo(() => {
    if (!selectedClass) return []; // Don't show students if no class is selected
    return students.filter(s => {
      const matchesClass = selectedClass === 'all' || s.class_id === selectedClass;
      const matchesSearch = !searchTerm || s.name.includes(searchTerm) || s.registration_id.includes(searchTerm);
      return matchesClass && matchesSearch;
    });
  }, [students, selectedClass, searchTerm]);`;

if (content.includes(oldFiltered)) {
    content = content.replace(oldFiltered, newFiltered);
} else {
    console.log("Could not find filteredStudents definition.");
}

// Change the select options
const oldSelect = `<select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg px-3 h-10 w-full sm:w-auto focus:border-[#1A7FAA] outline-hidden cursor-pointer shrink-0"
              >
                <option value="all">جميع المجموعات</option>`;

const newSelect = `<select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg px-3 h-10 w-full sm:w-auto focus:border-[#1A7FAA] outline-hidden cursor-pointer shrink-0"
              >
                <option value="" disabled>اختر المجموعة...</option>
                <option value="all">جميع المجموعات</option>`;

if (content.includes(oldSelect)) {
    content = content.replace(oldSelect, newSelect);
    console.log("Patched select successfully.");
} else {
    console.log("Could not find select definition.");
}

// Update the message in the table
const oldNoStudents = `<td colSpan={selectedClass === 'all' ? 4 : 3} className="py-8 text-center text-slate-500 font-bold">
                      لا يوجد طلاب في هذه المجموعة
                    </td>`;

const newNoStudents = `<td colSpan={selectedClass === 'all' ? 4 : 3} className="py-8 text-center text-slate-500 font-bold">
                      {selectedClass === '' ? 'يرجى اختيار مجموعة أولاً' : 'لا يوجد طلاب في هذه المجموعة'}
                    </td>`;

if (content.includes(oldNoStudents)) {
    content = content.replace(oldNoStudents, newNoStudents);
}

const oldNoStudentsPrint = `<td colSpan={selectedClass === 'all' ? 6 : 5} className="py-8 text-center text-slate-500 font-bold">
                  لا يوجد طلاب في هذه المجموعة
                </td>`;

const newNoStudentsPrint = `<td colSpan={selectedClass === 'all' ? 6 : 5} className="py-8 text-center text-slate-500 font-bold">
                  {selectedClass === '' ? 'يرجى اختيار مجموعة أولاً' : 'لا يوجد طلاب في هذه المجموعة'}
                </td>`;

if (content.includes(oldNoStudentsPrint)) {
    content = content.replace(oldNoStudentsPrint, newNoStudentsPrint);
}

fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
console.log("Done.");
