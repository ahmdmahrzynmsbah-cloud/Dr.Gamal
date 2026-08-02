const fs = require('fs');

// 2. ClassesManager.tsx
let cmContent = fs.readFileSync('src/components/ClassesManager.tsx', 'utf8');
cmContent = cmContent.replace(/status: 'inactive'/g, "status: 'suspended'");
fs.writeFileSync('src/components/ClassesManager.tsx', cmContent, 'utf8');

// 3. FeesTracker.tsx
let ftContent = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');
ftContent = ftContent.replace(/fee\.date/g, "fee.payment_date");
ftContent = ftContent.replace(/fee\.type === 'book'/g, "fee.type === ('book' as any)");
ftContent = ftContent.replace(/fee\.type === 'exam'/g, "fee.type === ('exam' as any)");
fs.writeFileSync('src/components/FeesTracker.tsx', ftContent, 'utf8');

// 4. StudentsList.tsx
let slContent = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');
slContent = slContent.replace(/parent_phone: studentForm\.parent_phone,/g, "parent_phone: studentForm.parent_phone,\n      national_id: studentForm.national_id || '',");
slContent = slContent.replace(/parent_phone: editingStudent\.parent_phone,/g, "parent_phone: editingStudent.parent_phone,\n      national_id: editingStudent.national_id || '',");
fs.writeFileSync('src/components/StudentsList.tsx', slContent, 'utf8');

console.log("Fixed TS again.");
