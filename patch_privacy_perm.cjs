const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
const appTarget = `return fullNavItems.filter(item => user.permissions.includes(item.id));`;
const appReplacement = `return fullNavItems.filter(item => user.permissions.includes(item.id) || item.id === 'privacy');`;

if (appContent.includes(appTarget)) {
    appContent = appContent.replace(appTarget, appReplacement);
    fs.writeFileSync('src/App.tsx', appContent, 'utf8');
    console.log("Patched App.tsx");
} else {
    console.log("Could not patch App.tsx");
}

let rolesContent = fs.readFileSync('src/components/SystemRoles.tsx', 'utf8');
const rolesTarget = `    { id: 'privacy', label: 'سياسة الخصوصية' }
  ];`;
const rolesReplacement = `  ];`;

if (rolesContent.includes(rolesTarget)) {
    rolesContent = rolesContent.replace(rolesTarget, rolesReplacement);
    // There will be a trailing comma on the previous element, but that's fine in JS/TS.
    fs.writeFileSync('src/components/SystemRoles.tsx', rolesContent, 'utf8');
    console.log("Patched SystemRoles.tsx");
} else {
    console.log("Could not patch SystemRoles.tsx");
}
