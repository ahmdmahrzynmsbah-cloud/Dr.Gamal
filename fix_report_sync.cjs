const fs = require('fs');
let content = fs.readFileSync('src/components/StudentFullReport.tsx', 'utf8');

if (!content.includes('useSamsDbSync')) {
  // Add import
  const importsEnd = content.lastIndexOf("import");
  const nextLineIdx = content.indexOf("\n", importsEnd);
  content = content.substring(0, nextLineIdx) + "\nimport { useSamsDbSync } from '../hooks/useSamsDbSync';" + content.substring(nextLineIdx);

  // Replace useEffect with loadData
  const targetEffect = `  useEffect(() => {
    // Load class info
    const classes = samsDb.getClasses();
    setClassInfo(classes.find(c => c.id === student.class_id) || null);

    // Load attendance
    const allAtt = samsDb.getAttendance();
    setAttendance(allAtt.filter(a => a.student_id === student.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    // Load Exams
    const allExams = samsDb.getExams();
    const allExamGrades = samsDb.getExamGrades();
    const studentExams = allExamGrades
      .filter(g => g.student_id === student.id)
      .map(g => {
        const exam = allExams.find(e => e.id === g.exam_id);
        return exam ? { ...g, exam } : null;
      })
      .filter(Boolean) as (ExamGrade & { exam: Exam })[];
    setExamGrades(studentExams.sort((a, b) => new Date(b.exam.date).getTime() - new Date(a.exam.date).getTime()));

    // Load Assignments
    const allAssignments = samsDb.getAssignments();
    const allAssignmentGrades = samsDb.getAssignmentGrades();
    const studentAssignments = allAssignmentGrades
      .filter(g => g.student_id === student.id)
      .map(g => {
        const assignment = allAssignments.find(a => a.id === g.assignment_id);
        return assignment ? { ...g, assignment } : null;
      })
      .filter(Boolean) as (AssignmentGrade & { assignment: Assignment })[];
    setAssignmentGrades(studentAssignments.sort((a, b) => new Date(b.assignment.due_date).getTime() - new Date(a.assignment.due_date).getTime()));

    // Load Fees
    const allFees = samsDb.getFees();
    setFees(allFees.filter(f => f.student_id === student.id).sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()));
  }, [student]);`;

  const replaceEffect = `  useSamsDbSync(() => {
    loadData();
  });

  const loadData = () => {
    // Load class info
    const classes = samsDb.getClasses();
    setClassInfo(classes.find(c => c.id === student.class_id) || null);

    // Load attendance
    const allAtt = samsDb.getAttendance();
    setAttendance(allAtt.filter(a => a.student_id === student.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    // Load Exams
    const allExams = samsDb.getExams();
    const allExamGrades = samsDb.getExamGrades();
    const studentExams = allExamGrades
      .filter(g => g.student_id === student.id)
      .map(g => {
        const exam = allExams.find(e => e.id === g.exam_id);
        return exam ? { ...g, exam } : null;
      })
      .filter(Boolean) as (ExamGrade & { exam: Exam })[];
    setExamGrades(studentExams.sort((a, b) => new Date(b.exam.date).getTime() - new Date(a.exam.date).getTime()));

    // Load Assignments
    const allAssignments = samsDb.getAssignments();
    const allAssignmentGrades = samsDb.getAssignmentGrades();
    const studentAssignments = allAssignmentGrades
      .filter(g => g.student_id === student.id)
      .map(g => {
        const assignment = allAssignments.find(a => a.id === g.assignment_id);
        return assignment ? { ...g, assignment } : null;
      })
      .filter(Boolean) as (AssignmentGrade & { assignment: Assignment })[];
    setAssignmentGrades(studentAssignments.sort((a, b) => new Date(b.assignment.due_date).getTime() - new Date(a.assignment.due_date).getTime()));

    // Load Fees
    const allFees = samsDb.getFees();
    setFees(allFees.filter(f => f.student_id === student.id).sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()));
  };

  useEffect(() => {
    loadData();
  }, [student]);`;

  content = content.replace(targetEffect, replaceEffect);
  fs.writeFileSync('src/components/StudentFullReport.tsx', content, 'utf8');
}
