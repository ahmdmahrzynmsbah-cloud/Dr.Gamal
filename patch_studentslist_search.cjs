const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');

// Ensure useMemo is imported
if (!content.includes('useMemo')) {
    content = content.replace('useState, useEffect } from', 'useState, useEffect, useMemo } from');
}

const target = `  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.includes(searchTerm) || s.registration_id.includes(searchTerm);
    const matchesClass = classFilter === 'all' || s.class_id === classFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesClass && matchesStatus;
  });`;

const replacement = `  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.includes(searchTerm) || s.registration_id.includes(searchTerm);
      const matchesClass = classFilter === 'all' || s.class_id === classFilter;
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchTerm, classFilter, statusFilter]);`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/components/StudentsList.tsx', content, 'utf8');
    console.log("StudentsList.tsx search patched successfully.");
} else {
    console.log("Could not find target block in StudentsList.tsx");
}
