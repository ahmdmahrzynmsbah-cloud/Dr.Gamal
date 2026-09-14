const fs = require('fs');
const path = './src/components/ParentsList.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  '<div className="flex flex-col md:flex-row flex-wrap items-center gap-3 w-full pb-2 pt-1">',
  '<div className="flex flex-col gap-3 w-full pb-2 pt-1">'
);
content = content.replace(
  '<div className="relative w-full md:flex-1 min-w-[280px]">',
  '<div className="relative w-full">'
);
content = content.replace(
  '</div>\n          {/* Grade Filter of Children */}',
  '</div>\n          <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full no-scrollbar">\n          {/* Grade Filter of Children */}'
);
content = content.replace(
  '          </select>\n        </div>\n\n        {/* Mobile Cards View */}',
  '          </select>\n          </div>\n        </div>\n\n        {/* Mobile Cards View */}'
);

content = content.replace(/className="w-full md:w-auto/g, 'className="shrink-0 min-w-max');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed ParentsList.tsx');
