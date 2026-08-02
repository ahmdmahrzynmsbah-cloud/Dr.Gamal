const fs = require('fs');

// 2. ClassesManager.tsx
let cmContent = fs.readFileSync('src/components/ClassesManager.tsx', 'utf8');
cmContent = cmContent.replace(/status: 'active' as 'active' \| 'inactive'/g, "status: 'active' as 'active' | 'suspended' | 'archived', national_id: ''");
cmContent = cmContent.replace(/parent_phone: newStudentForm\.parent_phone,/g, "parent_phone: newStudentForm.parent_phone,\n                      national_id: newStudentForm.national_id,");
fs.writeFileSync('src/components/ClassesManager.tsx', cmContent, 'utf8');

// 4. StudentsList.tsx
let slContent = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');
slContent = slContent.replace(/parent_phone: studentForm\.parent_phone,/g, "parent_phone: studentForm.parent_phone, national_id: studentForm.national_id || '',");
slContent = slContent.replace(/parent_phone: editingStudent\.parent_phone,/g, "parent_phone: editingStudent.parent_phone, national_id: editingStudent.national_id || '',");
fs.writeFileSync('src/components/StudentsList.tsx', slContent, 'utf8');

console.log("Fixed TS again.");
