const fs = require('fs');
let content = fs.readFileSync('src/components/ClassesManager.tsx', 'utf8');

const target827 = "نود إحاطتكم بجدول مواعيد المجموعة (${selectedClassForStudents.schedule_days || 'المحددة'} - ${selectedClassForStudents.schedule_time || ''}). نرجو التكرم بحث الطلاب على الانضباط والمتابعة المستمرة.";
const new827 = "نود إحاطتكم بجدول مواعيد المجموعة (${selectedClassForStudents.schedule_time || selectedClassForStudents.schedule_days || 'المحددة'}). نرجو التكرم بحث الطلاب على الانضباط والمتابعة المستمرة.";
content = content.replace(target827, new827);

fs.writeFileSync('src/components/ClassesManager.tsx', content, 'utf8');
console.log("Rendering 827 patched.");
