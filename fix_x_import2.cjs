const fs = require('fs');
let content = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');

content = content.replace("} from , X\n} from 'lucide-react';\n", "\n  , X\n} from 'lucide-react';\n");

fs.writeFileSync('src/components/FeesTracker.tsx', content, 'utf8');
