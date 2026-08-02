const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

const target = `  const filteredStudents = useMemo(() => {
    if (selectedClass === 'all') return students;
    return students.filter(s => s.class_id === selectedClass);
  }, [students, selectedClass]);`;

const replacement = `  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesClass = selectedClass === 'all' || s.class_id === selectedClass;
      const matchesSearch = !searchTerm || s.name.includes(searchTerm) || s.registration_id.includes(searchTerm);
      return matchesClass && matchesSearch;
    });
  }, [students, selectedClass, searchTerm]);`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
    console.log("Updated filteredStudents in AttendanceTracker.tsx");
} else {
    console.log("Could not find filteredStudents target block.");
}
