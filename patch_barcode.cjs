const fs = require('fs');
let content = fs.readFileSync('src/components/StudentBarcodes.tsx', 'utf8');

content = content.replace(/{classroom\?\.schedule_days \|\| 'غير محدد'} \| {classroom\?\.schedule_time \? \`الساعة \${classroom\.schedule_time}\` : 'غير محدد'}/g, "{classroom?.schedule_time || classroom?.schedule_days || 'غير محدد'}");

fs.writeFileSync('src/components/StudentBarcodes.tsx', content, 'utf8');
console.log("Barcode rendering patched.");
