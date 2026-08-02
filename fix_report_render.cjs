const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');

const targetStr = `      <AnimatePresence>
        {showFullReport && selectedProfile && (
          <StudentFullReport
            student={selectedProfile}
            onClose={() => {
              setShowFullReport(false);
              setSelectedProfile(null);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}`;

content = content.replace(targetStr, `    </>
  );
}`);

const mainRenderTarget = '  return (\n    <>\n';

const replacement = `  if (showFullReport && selectedProfile) {
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

  return (
    <>
`;

content = content.replace(mainRenderTarget, replacement);
fs.writeFileSync('src/components/StudentsList.tsx', content, 'utf8');
