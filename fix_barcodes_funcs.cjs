const fs = require('fs');
let content = fs.readFileSync('src/components/StudentBarcodes.tsx', 'utf8');

const singleTarget = `  const handlePrintSingle = (student: Student) => {
    const classroom = classes.find(c => c.id === student.class_id);
    const scheduleDays = classroom?.schedule_days || '';
    const scheduleTime = classroom?.schedule_time || '';
    
    const printWindow = window.open('', '_blank', 'width=450,height=300');`;

const singleReplace = `  const handlePrintSingle = (student: Student) => {
    handleProcessAction('جاري تجهيز بطاقة الطالب...', () => {
      setPrintTargetStudents([student]);
      setShowPrintModal(true);
    });
  };

  const old_handlePrintSingle_ignored = (student: Student) => {
    const classroom = classes.find(c => c.id === student.class_id);
    const scheduleDays = classroom?.schedule_days || '';
    const scheduleTime = classroom?.schedule_time || '';
    
    const printWindow = window.open('', '_blank', 'width=450,height=300');`;

content = content.replace(singleTarget, singleReplace);

const bulkTarget = `  const handlePrintBulk = (selectedStudentsList: Student[]) => {
    if (selectedStudentsList.length === 0) return;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');`;

const bulkReplace = `  const handlePrintBulk = (selectedStudentsList: Student[]) => {
    if (selectedStudentsList.length === 0) return;
    handleProcessAction('جاري تجهيز بطاقات الطلاب للطباعة...', () => {
      setPrintTargetStudents(selectedStudentsList);
      setShowPrintModal(true);
    });
  };

  const old_handlePrintBulk_ignored = (selectedStudentsList: Student[]) => {
    if (selectedStudentsList.length === 0) return;
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');`;

content = content.replace(bulkTarget, bulkReplace);

fs.writeFileSync('src/components/StudentBarcodes.tsx', content, 'utf8');
console.log("Updated print handlers in Barcodes");
