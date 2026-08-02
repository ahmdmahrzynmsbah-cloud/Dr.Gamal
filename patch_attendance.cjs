const fs = require('fs');
let content = fs.readFileSync('src/components/AttendanceTracker.tsx', 'utf8');

if (!content.includes('useSamsDbSync')) {
  // Add import
  const importsEnd = content.lastIndexOf("import");
  const nextLineIdx = content.indexOf("\n", importsEnd);
  content = content.substring(0, nextLineIdx) + "\nimport { useSamsDbSync } from '../hooks/useSamsDbSync';" + content.substring(nextLineIdx);

  // Replace interval with hook
  const target = `  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Polling for updates
    return () => clearInterval(interval);
  }, []);`;

  const replace = `  useEffect(() => {
    loadData();
  }, []);

  useSamsDbSync(() => {
    loadData();
  });`;

  content = content.replace(target, replace);
  fs.writeFileSync('src/components/AttendanceTracker.tsx', content, 'utf8');
}
