const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    {
      id: 'classes_group',
      label: 'المجموعات والحصص',
      icon: <BookOpen className="w-4 h-4" />,
      roles: ['teacher'],
      subItems: [
        { id: 'classes', label: 'المجموعات والجدول والمقررات', roles: ['teacher', 'secretary'] },
      ]
    },`;

const replacement = `    {
      id: 'classes_group',
      label: 'المجموعات والحصص',
      icon: <BookOpen className="w-4 h-4" />,
      roles: ['teacher', 'secretary'],
      subItems: [
        { id: 'classes', label: 'المجموعات والجدول والمقررات', roles: ['teacher', 'secretary'] },
      ]
    },`;

code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
