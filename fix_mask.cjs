const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/components/**/*.tsx');
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;
  
  // Find all className="...overflow-x-auto..."
  content = content.replace(/className=(["'])([^"']*overflow-x-auto[^"']*)(["'])/g, (match, p1, p2, p3) => {
    // If it doesn't already have mask-edges, add it
    if (!p2.includes('mask-edges')) {
      hasChanges = true;
      return `className=${p1}${p2} mask-edges${p3}`;
    }
    return match;
  });

  // Also catch className={\`...overflow-x-auto...\`}
  content = content.replace(/className=\{`([^`]*overflow-x-auto[^`]*)`\}/g, (match, p1) => {
    if (!p1.includes('mask-edges')) {
      hasChanges = true;
      return `className={\`${p1} mask-edges\`}`;
    }
    return match;
  });

  if (hasChanges) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Total files modified: ${modifiedCount}`);
