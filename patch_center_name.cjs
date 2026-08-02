const fs = require('fs');
let content = fs.readFileSync('src/components/ExamsAndAssignments.tsx', 'utf8');

content = content.replace(/localStorage\.getItem\('sams_center_name'\) \|\| 'المركز التعليمي التخصصي SAMS'/g, "'الدكتور في اللغة العربية'");

fs.writeFileSync('src/components/ExamsAndAssignments.tsx', content, 'utf8');
console.log("Center name updated in ExamsAndAssignments.tsx");
