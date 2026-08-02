const fs = require('fs');
let content = fs.readFileSync('src/components/ExamsAndAssignments.tsx', 'utf8');

// find the function triggerPrintPDF and replace it
const targetStr = `  const triggerPrintPDF = () => {
    if (!activeEvaluationObj) return;

    const centerName = localStorage.getItem('sams_center_name') || 'المركز التعليمي التخصصي SAMS';`;

const replacementStr = `  const triggerPrintPDF = () => {
    if (!activeEvaluationObj) return;
    handleProcessAction('جاري تجهيز تقرير الدرجات للطباعة...', () => {
      setShowPrintModal(true);
    });
  };

  const old_triggerPrintPDF_ignored = () => {
    if (!activeEvaluationObj) return;

    const centerName = localStorage.getItem('sams_center_name') || 'المركز التعليمي التخصصي SAMS';`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/ExamsAndAssignments.tsx', content, 'utf8');
console.log("Updated triggerPrintPDF");
