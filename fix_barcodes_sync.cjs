const fs = require('fs');
let content = fs.readFileSync('src/components/StudentBarcodes.tsx', 'utf8');

content = content.replace("import Barcode from './Barcode';", "import Barcode from './Barcode';\nimport { useSamsDbSync } from '../hooks/useSamsDbSync';");

fs.writeFileSync('src/components/StudentBarcodes.tsx', content, 'utf8');
