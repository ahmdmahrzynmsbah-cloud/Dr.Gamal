const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');

// Add gradeLevelFilter state
content = content.replace(
  /const \[statusFilter, setStatusFilter\] = useState\('all'\);/,
  `const [statusFilter, setStatusFilter] = useState('all');\n  const [gradeLevelFilter, setGradeLevelFilter] = useState('all');`
);

// Update filteredStudents
content = content.replace(
  /const matchesStatus = statusFilter === 'all' \|\| s\.status === statusFilter;\n\s*return matchesSearch && matchesClass && matchesStatus;\n\s*\}\);\n\s*\}, \[students, searchTerm, classFilter, statusFilter\]\);/,
  `const matchesStatus = statusFilter === 'all' || s.status === statusFilter;\n      const matchesGrade = gradeLevelFilter === 'all' || s.grade_level === gradeLevelFilter;\n      return matchesSearch && matchesClass && matchesStatus && matchesGrade;\n    });\n  }, [students, searchTerm, classFilter, statusFilter, gradeLevelFilter]);`
);

// Render filter dropdown
content = content.replace(
  /<div className="flex w-full md:w-auto items-center gap-3 overflow-x-auto no-scrollbar">\s*<div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900\/50 px-3 py-1\.5 rounded-xl border border-slate-200 dark:border-slate-700">/,
  `<div className="flex w-full md:w-auto items-center gap-3 overflow-x-auto no-scrollbar">
          <select value={gradeLevelFilter} onChange={e => setGradeLevelFilter(e.target.value)} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer">
            <option value="all">كل الصفوف الدراسية</option>
            <option value="الأول الإعدادي">الأول الإعدادي</option>
            <option value="الثاني الإعدادي">الثاني الإعدادي</option>
            <option value="الثالث الإعدادي">الثالث الإعدادي</option>
            <option value="الأول الثانوي">الأول الثانوي</option>
            <option value="الثاني الثانوي">الثاني الثانوي</option>
            <option value="الثالث الثانوي">الثالث الثانوي</option>
          </select>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">`
);

fs.writeFileSync('src/components/StudentsList.tsx', content, 'utf8');
