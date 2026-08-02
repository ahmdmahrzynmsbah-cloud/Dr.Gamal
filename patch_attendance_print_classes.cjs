const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

const oldWrapper = '<div className="space-y-6 animate-fade-in" dir="rtl">';
const newWrapper = '<div className="space-y-6 animate-fade-in print:hidden" dir="rtl">';

if (content.includes(oldWrapper)) {
    content = content.replace(oldWrapper, newWrapper);
    fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
    console.log("Patched AttendanceTracker.tsx wrapper");
} else {
    console.log("Could not find wrapper");
}
