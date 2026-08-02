const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

// Undo the type definition corruption
content = content.replace(/status: 'success' as const \| 'already_present' \| 'wrong_day'/g, "status: 'success' | 'already_present' | 'wrong_day'");
content = content.replace(/status: 'success' as const/g, "status: 'success'");
content = content.replace(/status: 'already_present' as const/g, "status: 'already_present'");
content = content.replace(/status: 'wrong_day' as const/g, "status: 'wrong_day'");

// Now fix the actual state updates by casting the object or just explicitly typing the array.
// The easiest way is to cast the state updater parameter.
content = content.replace(/setRecentScans\(prev => \[/g, "setRecentScans(prev => ([");
content = content.replace(/\{ student, timestamp: now, status: 'success' \},/g, "{ student, timestamp: now, status: 'success' as const },");
content = content.replace(/\{ student, timestamp: now, status: 'already_present' \},/g, "{ student, timestamp: now, status: 'already_present' as const },");
content = content.replace(/\{ student, timestamp: now, status: 'wrong_day' \},/g, "{ student, timestamp: now, status: 'wrong_day' as const },");

fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
