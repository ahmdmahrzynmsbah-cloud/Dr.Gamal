const fs = require('fs');
let content = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');

content = content.replace("import {", "import { X, ");

fs.writeFileSync('src/components/FeesTracker.tsx', content, 'utf8');
