const fs = require('fs');

let content = fs.readFileSync('src/data/initialData.ts', 'utf8');

// We want to replace all INITIAL_XXX arrays with []
content = content.replace(/export const INITIAL_TEACHERS: Teacher\[\] = \[.*?\];/s, 'export const INITIAL_TEACHERS: Teacher[] = [];');
content = content.replace(/export const INITIAL_CLASSES: ClassRoom\[\] = \[.*?\];/s, 'export const INITIAL_CLASSES: ClassRoom[] = [];');
content = content.replace(/export const INITIAL_STUDENTS: Student\[\] = \[.*?\];/s, 'export const INITIAL_STUDENTS: Student[] = [];');
content = content.replace(/export const INITIAL_SUBJECTS: Subject\[\] = \[.*?\];/s, 'export const INITIAL_SUBJECTS: Subject[] = [];');
content = content.replace(/export const INITIAL_GRADES: Grade\[\] = \[.*?\];/s, 'export const INITIAL_GRADES: Grade[] = [];');
content = content.replace(/export const INITIAL_ATTENDANCE: Attendance\[\] = \[.*?\];/s, 'export const INITIAL_ATTENDANCE: Attendance[] = [];');
content = content.replace(/export const INITIAL_FEES: FeePayment\[\] = \[.*?\];/s, 'export const INITIAL_FEES: FeePayment[] = [];');
content = content.replace(/export const INITIAL_NOTIFICATIONS: SystemNotification\[\] = \[.*?\];/s, 'export const INITIAL_NOTIFICATIONS: SystemNotification[] = [];');
content = content.replace(/export const INITIAL_AUDIT_LOGS: AuditLog\[\] = \[.*?\];/s, 'export const INITIAL_AUDIT_LOGS: AuditLog[] = [];');

fs.writeFileSync('src/data/initialData.ts', content, 'utf8');
