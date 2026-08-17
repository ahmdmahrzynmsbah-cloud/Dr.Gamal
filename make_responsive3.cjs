const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Table Headers
  content = content.replace(/className="([^"]*)px-4 py-3.5([^"]*)"/g, 'className="$1px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs sm:text-sm$2"');
  
  // Table Cells
  content = content.replace(/className="([^"]*)px-4 py-3([^"]*)"/g, 'className="$1px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm$2"');

  // Form Headers
  content = content.replace(/className="([^"]*)text-base([^"]*)"/g, 'className="$1text-sm sm:text-base$2"');

  fs.writeFileSync(filePath, content);
}
console.log('Done script 3');
