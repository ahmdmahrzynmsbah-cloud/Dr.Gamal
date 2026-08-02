const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');

const missingBlock = `  if (showFullReport && selectedProfile) {
    return (
      <StudentFullReport
        student={selectedProfile}
        onClose={() => {
          setShowFullReport(false);
          setSelectedProfile(null);
        }}
      />
    );
  }

`;

if (!content.includes('if (showFullReport && selectedProfile)')) {
  content = content.replace('  if (showArchiveModal) {', missingBlock + '  if (showArchiveModal) {');
  fs.writeFileSync('src/components/StudentsList.tsx', content, 'utf8');
  console.log("Restored missing block");
}
