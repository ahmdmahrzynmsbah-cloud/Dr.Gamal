const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

content = content.replace(/setRecentScans\(prev => \(\[/g, "setRecentScans(prev => [");

fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
