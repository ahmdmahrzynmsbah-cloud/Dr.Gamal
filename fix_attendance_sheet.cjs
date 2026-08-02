const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

// Undo the wrapper patch
content = content.replace('<div className="space-y-6 animate-fade-in print:hidden" dir="rtl">', '<div className="space-y-6 animate-fade-in" dir="rtl">');

// Wrap everything EXCEPT the printable sheet in a div with print:hidden
const splitMarker = '{/* PRINTABLE ATTENDANCE SHEET */}';
if (content.includes(splitMarker)) {
    let parts = content.split(splitMarker);
    
    // The first part contains the whole UI. We need to wrap its children?
    // Wait, better to just replace the main wrapper and then close it right before the printable sheet.
    
    // Instead of complex regex, let's just do:
    content = content.replace('<div className="space-y-6 animate-fade-in" dir="rtl">', '<div className="animate-fade-in" dir="rtl"><div className="space-y-6 print:hidden">');
    content = content.replace(splitMarker, '</div>' + splitMarker);
    
    fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
    console.log("Fixed wrapper layout");
} else {
    console.log("Could not find split marker");
}
