const fs = require('fs');

// 1. AttendanceTracker.tsx
let attContent = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');
attContent = attContent.replace(/status: 'success'/g, "status: 'success' as const");
attContent = attContent.replace(/status: 'already_present'/g, "status: 'already_present' as const");
attContent = attContent.replace(/status: 'wrong_day'/g, "status: 'wrong_day' as const");
fs.writeFileSync('src/components/AttendanceTracker.tsx', attContent, 'utf8');

// 2. ClassesManager.tsx
let cmContent = fs.readFileSync('src/components/ClassesManager.tsx', 'utf8');
cmContent = cmContent.replace(/status: 'inactive'/g, "status: 'suspended'");
fs.writeFileSync('src/components/ClassesManager.tsx', cmContent, 'utf8');

// 3. ExamsAndAssignments.tsx
let eaContent = fs.readFileSync('src/components/ExamsAndAssignments.tsx', 'utf8');
// (activeEvaluationObj as Exam).name || (activeEvaluationObj as Assignment).title
eaContent = eaContent.replace(/activeEvaluationObj\.name/g, "(activeEvaluationObj as any).name");
eaContent = eaContent.replace(/activeEvaluationObj\.title/g, "(activeEvaluationObj as any).title");
fs.writeFileSync('src/components/ExamsAndAssignments.tsx', eaContent, 'utf8');

// 4. FeesTracker.tsx
let ftContent = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');
ftContent = ftContent.replace(/fee\.date/g, "fee.payment_date");
// Fix the comparisons
ftContent = ftContent.replace(/fee\.type === 'book'/g, "fee.type === ('book' as any)");
ftContent = ftContent.replace(/fee\.type === 'exam'/g, "fee.type === ('exam' as any)");
fs.writeFileSync('src/components/FeesTracker.tsx', ftContent, 'utf8');

// 5. StudentsList.tsx
let slContent = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');
slContent = slContent.replace(/parent_phone: studentForm\.parent_phone,/g, "parent_phone: studentForm.parent_phone,\n      national_id: '',");
fs.writeFileSync('src/components/StudentsList.tsx', slContent, 'utf8');

console.log("Fixed TS issues.");
