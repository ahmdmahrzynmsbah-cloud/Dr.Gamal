const fs = require('fs');

// 4. StudentsList.tsx
let slContent = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');

slContent = slContent.replace(/status: studentForm\.status\n    \}/g, "status: studentForm.status,\n      national_id: ''\n    }");
slContent = slContent.replace(/status: editingStudent\.status\n    \}/g, "status: editingStudent.status,\n      national_id: editingStudent.national_id || ''\n    }");
fs.writeFileSync('src/components/StudentsList.tsx', slContent, 'utf8');

// 2. ClassesManager.tsx
let cmContent = fs.readFileSync('src/components/ClassesManager.tsx', 'utf8');
cmContent = cmContent.replace(/status: 'active',/g, "status: 'active' as any, national_id: '',");
cmContent = cmContent.replace(/national_id: newStudentForm\.national_id,\s+national_id: newStudentForm\.national_id,/g, "national_id: newStudentForm.national_id,");
fs.writeFileSync('src/components/ClassesManager.tsx', cmContent, 'utf8');

console.log("Fixed TS again.");
