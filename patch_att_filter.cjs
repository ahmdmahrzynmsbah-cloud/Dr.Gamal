const fs = require('fs');
let code = fs.readFileSync('src/components/StudentFullReport.tsx', 'utf8');

const target = `    // Load attendance
    const allAtt = samsDb.getAttendance();
    setAttendance(allAtt.filter(a => a.student_id === student.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));`;

const replacement = `    // Load attendance
    const allAtt = samsDb.getAttendance();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    setAttendance(allAtt.filter(a => {
      const attDate = new Date(a.date);
      return a.student_id === student.id && attDate.getMonth() === currentMonth && attDate.getFullYear() === currentYear;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/StudentFullReport.tsx', code);
