const fs = require('fs');
const files = fs.readdirSync('src/components/').filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filepath = 'src/components/' + file;
  let content = fs.readFileSync(filepath, 'utf8');
  
  if (content.includes('import {\nimport { useSamsDbSync }')) {
    content = content.replace("import {\nimport { useSamsDbSync } from '../hooks/useSamsDbSync';", "import { useSamsDbSync } from '../hooks/useSamsDbSync';\nimport {");
    fs.writeFileSync(filepath, content, 'utf8');
    console.log('Fixed', file);
  }
}
