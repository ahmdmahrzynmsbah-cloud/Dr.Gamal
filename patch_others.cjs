const fs = require('fs');
const files = ['src/components/Dashboard.tsx'];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('useSamsDbSync')) {
    const importsEnd = content.lastIndexOf("import");
    const nextLineIdx = content.indexOf("\n", importsEnd);
    content = content.substring(0, nextLineIdx) + "\nimport { useSamsDbSync } from '../hooks/useSamsDbSync';" + content.substring(nextLineIdx);
    
    if (content.includes('const loadData = () => {')) {
      content = content.replace('const loadData = () => {', "useSamsDbSync(() => {\n    loadData();\n  });\n\n  const loadData = () => {");
      fs.writeFileSync(file, content, 'utf8');
    }
  }
}
