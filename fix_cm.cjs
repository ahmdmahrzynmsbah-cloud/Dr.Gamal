const fs = require('fs');
let cmContent = fs.readFileSync('src/components/ClassesManager.tsx', 'utf8');

// replace duplicate
cmContent = cmContent.replace(/national_id: newStudentForm\.national_id,\s+national_id: newStudentForm\.national_id,/g, "national_id: newStudentForm.national_id,");
fs.writeFileSync('src/components/ClassesManager.tsx', cmContent, 'utf8');
console.log("Fixed CM duplicate.");
