const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix messed up classes from bad regex
  content = content.replace(/p-4 sm:p-6 sm:p-8/g, 'p-4 sm:p-6 md:p-8');
  content = content.replace(/p-4 sm:p-5 sm:p-4 sm:p-6/g, 'p-4 sm:p-5');
  content = content.replace(/p-4 sm:p-5 lg:p-6/g, 'p-4 sm:p-5 lg:p-6'); // unchanged
  content = content.replace(/gap-4 sm:p-5 lg:gap-4 sm:p-6/g, 'gap-4 lg:gap-6');
  
  content = content.replace(/px-3 sm:px-4 py-2 sm:py-3.5 text-xs sm:text-sm/g, 'px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm');
  
  // Duplicates cleanup
  content = content.replace(/px-3 sm:px-4 px-4/g, 'px-3 sm:px-4');
  content = content.replace(/text-sm sm:text-sm sm:text-base/g, 'text-sm sm:text-base');
  content = content.replace(/text-xs sm:text-sm sm:text-sm/g, 'text-xs sm:text-sm');

  fs.writeFileSync(filePath, content);
}
console.log('Fix applied');
