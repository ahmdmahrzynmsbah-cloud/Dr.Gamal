const fs = require('fs');
const path = './src/components/StudentsList.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  '</table>\n                </div>\n              );',
  '</table>\n                  </div>\n                </>\n              );'
);
fs.writeFileSync(path, content, 'utf8');
