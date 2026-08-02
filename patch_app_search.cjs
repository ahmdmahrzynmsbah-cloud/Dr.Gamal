const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `  // List matching students and teachers
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { students: [], teachers: [] };
    const cleanQuery = searchQuery.trim().toLowerCase();
    
    const studentsRes = samsDb.getStudents().filter(s => 
      s.name.toLowerCase().includes(cleanQuery) ||
      s.registration_id.toLowerCase().includes(cleanQuery) ||
      s.phone.toLowerCase().includes(cleanQuery) ||
      (s.parent_name && s.parent_name.toLowerCase().includes(cleanQuery)) ||
      s.national_id.includes(cleanQuery)
    ).slice(0, 5);

    const teachersRes = samsDb.getTeachers().filter(t => 
      t.name.toLowerCase().includes(cleanQuery) ||
      t.specialization.toLowerCase().includes(cleanQuery) ||
      t.phone.toLowerCase().includes(cleanQuery) ||
      t.national_id.includes(cleanQuery)
    ).slice(0, 3);

    return { students: studentsRes, teachers: teachersRes };
  }, [searchQuery, refreshTrigger]);`;

const replacement1 = `  // List matching students and teachers
  const allStudents = useMemo(() => samsDb.getStudents(), [refreshTrigger]);
  const allTeachers = useMemo(() => samsDb.getTeachers(), [refreshTrigger]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { students: [], teachers: [] };
    const cleanQuery = searchQuery.trim().toLowerCase();
    
    const studentsRes = allStudents.filter(s => 
      s.name.toLowerCase().includes(cleanQuery) ||
      s.registration_id.toLowerCase().includes(cleanQuery) ||
      s.phone.toLowerCase().includes(cleanQuery) ||
      (s.parent_name && s.parent_name.toLowerCase().includes(cleanQuery)) ||
      s.national_id.includes(cleanQuery)
    ).slice(0, 5);

    const teachersRes = allTeachers.filter(t => 
      t.name.toLowerCase().includes(cleanQuery) ||
      t.specialization.toLowerCase().includes(cleanQuery) ||
      t.phone.toLowerCase().includes(cleanQuery) ||
      t.national_id.includes(cleanQuery)
    ).slice(0, 3);

    return { students: studentsRes, teachers: teachersRes };
  }, [searchQuery, allStudents, allTeachers]);`;

if (content.includes(target1)) {
    content = content.replace(target1, replacement1);
    fs.writeFileSync('src/App.tsx', content, 'utf8');
    console.log("App.tsx search patched successfully.");
} else {
    console.log("Could not find target block in App.tsx");
}
