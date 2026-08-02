const fs = require('fs');
let content = fs.readFileSync('src/components/StudentFullReport.tsx', 'utf8');

const targetStr = `      <div className="flex-1 p-6 space-y-8 print:p-0 print:space-y-6">`;
const replacementStr = `      <div id="printable-group-roster" className="flex-1 p-6 space-y-8 print:p-0 print:space-y-6">`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/StudentFullReport.tsx', content, 'utf8');
console.log("Updated StudentFullReport with printable ID");
