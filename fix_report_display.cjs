const fs = require('fs');
let content = fs.readFileSync('src/components/ClassesManager.tsx', 'utf8');

// 1. Remove the old rendering of StudentFullReport at the bottom
const oldReportCode = `{/* Student Full Report Modal */}
        <AnimatePresence>
          {selectedStudentForReport && (
            <StudentFullReport
              student={selectedStudentForReport}
              onClose={() => setSelectedStudentForReport(null)}
            />
          )}
        </AnimatePresence>`;
content = content.replace(oldReportCode, '');

// 2. Add the early return inside the selectedClassForStudents block
const target = `    if (showPrintRosterModal) {`;
const replacement = `    if (selectedStudentForReport) {
      return (
        <StudentFullReport
          student={selectedStudentForReport}
          onClose={() => setSelectedStudentForReport(null)}
        />
      );
    }

    if (showPrintRosterModal) {`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/ClassesManager.tsx', content, 'utf8');
