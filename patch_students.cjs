const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');

if (!content.includes('useSamsDbSync')) {
  // Add import
  const importsEnd = content.lastIndexOf("import");
  const nextLineIdx = content.indexOf("\n", importsEnd);
  content = content.substring(0, nextLineIdx) + "\nimport { useSamsDbSync } from '../hooks/useSamsDbSync';" + content.substring(nextLineIdx);

  // Find loadData and add hook
  const target = `  const loadData = () => {`;
  const replace = `  useSamsDbSync(() => {
    loadData();
  });

  const loadData = () => {`;
  
  if (content.includes(target)) {
     content = content.replace(target, replace);
     fs.writeFileSync('src/components/StudentsList.tsx', content, 'utf8');
  }
}
