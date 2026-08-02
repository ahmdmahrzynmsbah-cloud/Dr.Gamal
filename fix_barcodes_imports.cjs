const fs = require('fs');
let content = fs.readFileSync('src/components/StudentBarcodes.tsx', 'utf8');

// Fix barcode props
content = content.replace(/fontSize=\{11\} \n*\s*margin=\{0\} \n*\s*displayValue=\{true\}/g, 'showText={true}');
content = content.replace(/fontSize=\{11\}\s*margin=\{0\}\s*displayValue=\{true\}/g, 'showText={true}');

// Add X, Printer, RefreshCw if missing
const lucideImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
if (lucideImportMatch) {
  let lucideImports = lucideImportMatch[1];
  if (!lucideImports.includes('RefreshCw')) lucideImports += ', RefreshCw';
  if (!lucideImports.includes('X')) lucideImports += ', X';
  if (!lucideImports.includes('Printer')) lucideImports += ', Printer';
  content = content.replace(lucideImportMatch[0], "import { " + lucideImports + " } from 'lucide-react'");
}

fs.writeFileSync('src/components/StudentBarcodes.tsx', content, 'utf8');
