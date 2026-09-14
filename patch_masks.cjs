const fs = require('fs');

const filesToPatch = {
  './src/components/SamsAgent.tsx': [
    {
      find: 'overflow-x-auto flex gap-2 no-scrollbar scroll-smooth"',
      replace: 'overflow-x-auto flex gap-2 no-scrollbar scroll-smooth mask-edges"'
    }
  ],
  './src/components/FeesTracker.tsx': [
    {
      find: 'shadow-3xs overflow-x-auto no-scrollbar scroll-smooth"',
      replace: 'shadow-3xs overflow-x-auto no-scrollbar scroll-smooth mask-edges"'
    },
    {
      find: 'overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth"',
      replace: 'overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth mask-edges"'
    },
    {
      find: 'overflow-x-auto no-scrollbar scroll-smooth pb-1"',
      replace: 'overflow-x-auto no-scrollbar scroll-smooth pb-1 mask-edges"'
    }
  ],
  './src/components/ExamsAndAssignments.tsx': [
    {
      find: 'overflow-x-auto no-scrollbar scroll-smooth"',
      replace: 'overflow-x-auto no-scrollbar scroll-smooth mask-edges"'
    }
  ],
  './src/components/NotificationsCenter.tsx': [
    {
      find: 'overflow-x-auto pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 no-scrollbar scroll-smooth"',
      replace: 'overflow-x-auto pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 no-scrollbar scroll-smooth mask-edges"'
    }
  ],
  './src/components/SystemAuditLogs.tsx': [
    {
      find: 'grid-cols-1 sm:grid-cols-3 gap-3 pt-1',
      replace: 'flex items-center gap-3 overflow-x-auto pb-2 w-full no-scrollbar mask-edges'
    },
    // We also need to fix the internal widths of the 3 columns in SystemAuditLogs if we convert it to flex
    {
      find: 'className="space-y-1.5">',
      replace: 'className="space-y-1.5 shrink-0 min-w-[220px] max-w-sm flex-1">'
    }
  ]
};

for (const [file, replacements] of Object.entries(filesToPatch)) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    for (const {find, replace} of replacements) {
      content = content.replace(new RegExp(find.replace(/[.*+?^$\{()|[\]\\]/g, '\\$&'), 'g'), replace);
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Patched ${file}`);
  }
}

