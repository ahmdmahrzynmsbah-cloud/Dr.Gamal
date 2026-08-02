const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

const targetClass = 'hidden print:block absolute inset-0 bg-white p-8 w-full h-full text-black';
const newClass = 'hidden print:block w-full bg-white text-black';

if (content.includes(targetClass)) {
    content = content.replace(targetClass, newClass);
    fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
    console.log("Patched AttendanceTracker.tsx");
} else {
    console.log("Not found target class");
}
