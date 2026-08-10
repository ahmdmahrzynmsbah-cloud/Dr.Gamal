const fs = require('fs');
let code = fs.readFileSync('src/utils/db.ts', 'utf8');

const target = `  addClass(cls: ClassRoom) {
    const classes = this.getClasses();
    classes.push(cls);
    saveToStorage(KEYS.CLASSES, classes);
    addAuditLog('INSERT', 'classes', cls.id, \`إنشاء مجموعة دراسي جديد: \${cls.name}\`);
  },`;

const replacement = `  addClass(cls: ClassRoom) {
    const classes = this.getClasses();
    classes.push(cls);
    saveToStorage(KEYS.CLASSES, classes);
    addAuditLog('INSERT', 'classes', cls.id, \`إنشاء مجموعة دراسي جديد: \${cls.name}\`);

    // If the creator is a secretary, add this class to their allowed_classes automatically
    const userId = localStorage.getItem('sams_logged_in_id');
    if (userId) {
       const users = this.getSystemUsers();
       const userIndex = users.findIndex((u: any) => u.id === userId);
       if (userIndex !== -1 && users[userIndex].role === 'secretary') {
           users[userIndex].allowed_classes = users[userIndex].allowed_classes || [];
           users[userIndex].allowed_classes.push(cls.id);
           this.saveSystemUsers(users);
       }
    }
  },`;

code = code.replace(target, replacement);
fs.writeFileSync('src/utils/db.ts', code);
