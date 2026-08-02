const fs = require('fs');
let content = fs.readFileSync('src/utils/db.ts', 'utf8');

const mergeLogic = `
  // Merge duplicates
  mergeStudents(keepId: string, deleteIds: string[]) {
    if (!deleteIds.length) return;

    // 1. Update Attendance
    const attendance = loadData<Attendance[]>(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    let changedAttendance = false;
    attendance.forEach(a => {
      if (deleteIds.includes(a.student_id)) {
        a.student_id = keepId;
        changedAttendance = true;
      }
    });
    if (changedAttendance) saveData(KEYS.ATTENDANCE, attendance);

    // 2. Update Fees
    const fees = loadData<FeePayment[]>(KEYS.FEES, INITIAL_FEES);
    let changedFees = false;
    fees.forEach(f => {
      if (deleteIds.includes(f.student_id)) {
        f.student_id = keepId;
        changedFees = true;
      }
    });
    if (changedFees) saveData(KEYS.FEES, fees);

    // 3. Update Grades
    const grades = loadData<Grade[]>(KEYS.GRADES, INITIAL_GRADES);
    let changedGrades = false;
    grades.forEach(g => {
      if (deleteIds.includes(g.student_id)) {
        g.student_id = keepId;
        changedGrades = true;
      }
    });
    if (changedGrades) saveData(KEYS.GRADES, grades);

    // 4. Update Exam Grades
    const examGrades = loadData<ExamGrade[]>(KEYS.EXAM_GRADES, []);
    let changedExamGrades = false;
    examGrades.forEach(g => {
      if (deleteIds.includes(g.student_id)) {
        g.student_id = keepId;
        changedExamGrades = true;
      }
    });
    if (changedExamGrades) saveData(KEYS.EXAM_GRADES, examGrades);

    // 5. Update Assignment Grades
    const assignmentGrades = loadData<AssignmentGrade[]>(KEYS.ASSIGNMENT_GRADES, []);
    let changedAssignmentGrades = false;
    assignmentGrades.forEach(g => {
      if (deleteIds.includes(g.student_id)) {
        g.student_id = keepId;
        changedAssignmentGrades = true;
      }
    });
    if (changedAssignmentGrades) saveData(KEYS.ASSIGNMENT_GRADES, assignmentGrades);

    // 6. Delete the old students
    deleteIds.forEach(id => {
      this.permanentlyDeleteStudent(id);
    });

    addAuditLog('UPDATE', 'students', keepId, \`تم دمج بيانات الطلاب وحذف النسخ المكررة (\${deleteIds.join(', ')})\`);
  },
`;

// Insert before the last closing brace of samsDb object.
if (content.includes('mergeStudents')) {
    console.log("Already added");
} else {
    // Find the end of samsDb
    const idx = content.lastIndexOf('};');
    if (idx !== -1) {
        content = content.substring(0, idx) + mergeLogic + content.substring(idx);
        fs.writeFileSync('src/utils/db.ts', content, 'utf8');
        console.log("Patched db.ts");
    } else {
        console.log("Could not find the end of samsDb");
    }
}
