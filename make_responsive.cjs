const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace fixed padding p-6 -> p-4 sm:p-6 for cards
  content = content.replace(/className="([^"]*)p-6([^"]*)"/g, 'className="$1p-4 sm:p-6$2"');
  // p-5 -> p-4 sm:p-5
  content = content.replace(/className="([^"]*)p-5([^"]*)"/g, 'className="$1p-4 sm:p-5$2"');
  
  // Replace spacing gap-6 -> gap-4 sm:gap-6
  content = content.replace(/className="([^"]*)gap-6([^"]*)"/g, 'className="$1gap-4 sm:gap-6$2"');

  // Replace text-2xl -> text-xl sm:text-2xl
  content = content.replace(/className="([^"]*)text-2xl([^"]*)"/g, 'className="$1text-xl sm:text-2xl$2"');

  // Replace text-3xl -> text-2xl sm:text-3xl
  content = content.replace(/className="([^"]*)text-3xl([^"]*)"/g, 'className="$1text-2xl sm:text-3xl$2"');

  fs.writeFileSync(filePath, content);
}
console.log('Done');
