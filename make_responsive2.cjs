const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace text-lg -> text-base sm:text-lg
  content = content.replace(/className="([^"]*)text-lg([^"]*)"/g, 'className="$1text-base sm:text-lg$2"');
  
  // Also fix tables. Ensure they are wrapped in an overflow container.
  // Actually, they already are in most places.
  
  // Update inputs to be slightly smaller on mobile
  content = content.replace(/className="([^"]*)px-4 py-2.5 text-sm([^"]*)"/g, 'className="$1px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm$2"');
  content = content.replace(/className="([^"]*)px-4 py-3 text-sm([^"]*)"/g, 'className="$1px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm$2"');

  fs.writeFileSync(filePath, content);
}
console.log('Done script 2');
