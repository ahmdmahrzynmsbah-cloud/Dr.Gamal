const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');

const targetToRemove = `      <AnimatePresence>
        {showFullReport && selectedProfile && (
          <StudentFullReport
            student={selectedProfile}
            onClose={() => {
              setShowFullReport(false);
              setSelectedProfile(null);
            }}
          />
        )}
      </AnimatePresence>`;

content = content.replace(targetToRemove, '');
fs.writeFileSync('src/components/StudentsList.tsx', content, 'utf8');
