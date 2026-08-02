const fs = require('fs');
let cmContent = fs.readFileSync('src/components/ClassesManager.tsx', 'utf8');

cmContent = cmContent.replace(/parent_phone: newStudentForm\.parent_phone,\s*national_id: newStudentForm\.national_id,/g, "parent_phone: newStudentForm.parent_phone,");

fs.writeFileSync('src/components/ClassesManager.tsx', cmContent, 'utf8');
console.log("Fixed CM duplicate.");
