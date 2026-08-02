const fs = require('fs');
let content = fs.readFileSync('src/utils/db.ts', 'utf8');

const target = `  }

  // Merge duplicates
  mergeStudents(keepId: string, deleteIds: string[]) {`;

const replacement = `  },

  // Merge duplicates
  mergeStudents(keepId: string, deleteIds: string[]) {`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/utils/db.ts', content, 'utf8');
    console.log("Patched comma");
} else {
    console.log("Not found");
}
