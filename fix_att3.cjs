const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

content = content.replace(/status: 'success' as 'success' \| 'already_present' \| 'wrong_day';/g, "status: 'success' | 'already_present' | 'wrong_day';");

fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
