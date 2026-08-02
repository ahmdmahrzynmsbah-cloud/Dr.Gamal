const fs = require('fs');
const file = 'src/components/StudentsList.tsx';
let content = fs.readFileSync(file, 'utf8');

const t1 = `  const confirmDelete = () => {
    if (studentToDelete) {
      samsDb.permanentlyDeleteStudent(studentToDelete.id);
      setSuccessMessage('تم حذف الطالب نهائياً بنجاح.');
      setStudentToDelete(null);
      loadData();
      if (selectedProfile?.id === studentToDelete.id) {
        setSelectedProfile(null);
      }
    }
  };`;

const r1 = `  const confirmDelete = () => {
    if (studentToDelete) {
      handleProcessAction("جاري الحذف النهائي...", () => {
        samsDb.permanentlyDeleteStudent(studentToDelete.id);
        setSuccessMessage('تم حذف الطالب نهائياً بنجاح.');
        setStudentToDelete(null);
        loadData();
        if (selectedProfile?.id === studentToDelete.id) {
          setSelectedProfile(null);
        }
      });
    }
  };`;

content = content.replace(t1, r1);

const t2 = `                  onClick={() => {
                    samsDb.permanentlyDeleteStudent(archivedStudentToPermanentDelete.id);
                    setArchivedStudentToPermanentDelete(null);
                    loadData();
                    setSuccessMessage('تم مسح بيانات الطالب نهائياً من قاعدة البيانات.');
                  }}`;
                  
const r2 = `                  onClick={() => {
                    handleProcessAction("جاري الحذف النهائي...", () => {
                      samsDb.permanentlyDeleteStudent(archivedStudentToPermanentDelete.id);
                      setArchivedStudentToPermanentDelete(null);
                      loadData();
                      setSuccessMessage('تم مسح بيانات الطالب نهائياً من قاعدة البيانات.');
                    });
                  }}`;

content = content.replace(t2, r2);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated delete operations.");
