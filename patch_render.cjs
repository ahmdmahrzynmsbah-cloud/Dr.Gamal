const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');

const target = `  if (showArchiveModal) {`;

const replacement = `  if (showDuplicatesModal) {
    return (
      <DuplicateStudentsChecker 
        students={students} 
        onClose={() => setShowDuplicatesModal(false)} 
        onRefresh={loadData} 
      />
    );
  }

  if (showArchiveModal) {`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/components/StudentsList.tsx', content, 'utf8');
    console.log("Patched render");
} else {
    console.log("Target not found");
}
