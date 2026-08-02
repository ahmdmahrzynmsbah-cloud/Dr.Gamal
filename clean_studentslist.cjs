const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');

const regex = /\s*\{\/\* Permanent Delete Confirmation Modal \*\/\}\s*<AnimatePresence>[\s\S]*?\{archivedStudentToPermanentDelete && \([\s\S]*?<\/AnimatePresence>/g;

let matches = content.match(regex);
if (matches && matches.length > 1) {
    // Keep the first one (the one I just added inside the early return)
    // and remove the second one (the one at the bottom)
    const lastMatch = matches[matches.length - 1];
    const lastIndex = content.lastIndexOf(lastMatch);
    content = content.substring(0, lastIndex) + content.substring(lastIndex + lastMatch.length);
    fs.writeFileSync('src/components/StudentsList.tsx', content, 'utf8');
    console.log("Removed duplicate permanent delete modal at the bottom.");
} else {
    console.log("No duplicates found.", matches ? matches.length : 0);
}

