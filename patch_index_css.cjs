const fs = require('fs');
let content = fs.readFileSync('src/index.css', 'utf8');

content = content.replace('#printable-group-roster,', '#printable-group-roster,\n  #printable-attendance-sheet,\n  #printable-attendance-sheet *,');
content = content.replace('#printable-group-roster {', '#printable-group-roster,\n  #printable-attendance-sheet {');

fs.writeFileSync('src/index.css', content, 'utf8');
