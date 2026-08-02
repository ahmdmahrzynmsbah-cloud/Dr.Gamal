const fs = require('fs');
let content = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');

const lucideImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
if (lucideImportMatch) {
  let lucideImports = lucideImportMatch[1];
  if (!lucideImports.includes('X')) lucideImports += ', X';
  content = content.replace(lucideImportMatch[0], "import { " + lucideImports + " } from 'lucide-react'");
}
fs.writeFileSync('src/components/FeesTracker.tsx', content, 'utf8');
