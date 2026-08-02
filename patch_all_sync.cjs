const fs = require('fs');
const files = fs.readdirSync('src/components/').filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filepath = 'src/components/' + file;
  let content = fs.readFileSync(filepath, 'utf8');
  
  if (content.includes('const loadData = () => {') && !content.includes('useSamsDbSync')) {
    const importsEnd = content.lastIndexOf("import");
    const nextLineIdx = content.indexOf("\n", importsEnd);
    if (nextLineIdx !== -1) {
      content = content.substring(0, nextLineIdx) + "\nimport { useSamsDbSync } from '../hooks/useSamsDbSync';" + content.substring(nextLineIdx);
      content = content.replace('const loadData = () => {', "useSamsDbSync(() => {\n    loadData();\n  });\n\n  const loadData = () => {");
      fs.writeFileSync(filepath, content, 'utf8');
      console.log('Patched', file);
    }
  }
}
