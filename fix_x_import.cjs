const fs = require('fs');
let content = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');

content = content.replace("import { X,  motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");

const lucideIndex = content.indexOf("'lucide-react';");
if (lucideIndex !== -1) {
  content = content.substring(0, lucideIndex) + ", X\n} from 'lucide-react';\n" + content.substring(lucideIndex + 15);
}

fs.writeFileSync('src/components/FeesTracker.tsx', content, 'utf8');
