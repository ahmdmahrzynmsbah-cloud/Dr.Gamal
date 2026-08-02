const fs = require('fs');
const file = 'src/components/ClassesManager.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                    onClick={() => {
                      samsDb.permanentlyDeleteStudent(archivedStudentToPermanentDelete.id);
                      setArchivedStudentToPermanentDelete(null);
                      loadData();
                      setSuccessText('تم مسح بيانات الطالب نهائياً من قاعدة البيانات.');
                    }}`;

const replacementStr = `                    onClick={() => {
                      handleProcessAction("جاري الحذف النهائي...", () => {
                        samsDb.permanentlyDeleteStudent(archivedStudentToPermanentDelete.id);
                        setArchivedStudentToPermanentDelete(null);
                        loadData();
                        setSuccessText('تم مسح بيانات الطالب نهائياً من قاعدة البيانات.');
                      });
                    }}`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(file, content, 'utf8');
console.log("Updated delete action.");
