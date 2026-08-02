const fs = require('fs');
let content = fs.readFileSync('src/components/ClassesManager.tsx', 'utf8');

content = content.replace(/{selectedClassForStudents\.schedule_days} - {selectedClassForStudents\.schedule_time}/g, '{selectedClassForStudents.schedule_time || selectedClassForStudents.schedule_days}');
content = content.replace(/\({selectedClassForStudents\.schedule_days \|\| 'المحددة'} - {selectedClassForStudents\.schedule_time \|\| ''}\)/g, '({selectedClassForStudents.schedule_time || selectedClassForStudents.schedule_days || "المحددة"})');
content = content.replace(/<span>المواعيد: <strong>{selectedClassForStudents\.schedule_days \|\| 'غير محدد'}<\/strong> \({selectedClassForStudents\.schedule_time \|\| ''}\)<\/span>/g, '<span>المواعيد: <strong>{selectedClassForStudents.schedule_time || selectedClassForStudents.schedule_days || "غير محدد"}</strong></span>');
content = content.replace(/{cls\.schedule_days \? \`\${cls\.schedule_days} - \${cls\.schedule_time \|\| ''}\` : 'ـ لم تحدد بعد ـ'}/g, "{cls.schedule_days ? cls.schedule_time || cls.schedule_days : 'ـ لم تحدد بعد ـ'}");

fs.writeFileSync('src/components/ClassesManager.tsx', content, 'utf8');
console.log("Rendering patched.");
