const fs = require('fs');

const cssPath = './src/index.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');
if (!cssContent.includes('.mask-edges')) {
  cssContent += `
/* Faded edges for scrollable ribbons (تشويش الحواف) */
.mask-edges {
  -webkit-mask-image: linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent);
  mask-image: linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent);
}
`;
  fs.writeFileSync(cssPath, cssContent, 'utf8');
}

const files = [
  './src/components/StudentsList.tsx',
  './src/components/ParentsList.tsx',
  './src/components/ClassesManager.tsx'
];

for (const path of files) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(
      'className="flex items-center gap-2 overflow-x-auto pb-1 w-full no-scrollbar"',
      'className="flex items-center gap-2 overflow-x-auto pb-1 w-full no-scrollbar mask-edges"'
    );
    fs.writeFileSync(path, content, 'utf8');
  }
}

console.log('Fixed blur edges');
