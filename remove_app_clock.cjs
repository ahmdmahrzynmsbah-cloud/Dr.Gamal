const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /const \[currentTime, setCurrentTime\] = useState\(new Date\(\)\);\s*useEffect\(\(\) => \{\s*const timer = setInterval\(\(\) => \{\s*setCurrentTime\(new Date\(\)\);\s*\}, 1000\);\s*return \(\) => clearInterval\(timer\);\s*\}, \[\]\);/g,
  ''
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
