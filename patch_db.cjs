const fs = require('fs');
let code = fs.readFileSync('src/utils/db.ts', 'utf8');

const getStudentsTarget = `  getStudents(includeArchivedOrSuspended = true): Student[] {
    const students = loadFromStorage<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    // filter soft deletions
    return students.filter(s => !s.deleted_at);
  },`;

const getStudentsReplacement = `  getStudents(includeArchivedOrSuspended = true): Student[] {
    const students = loadFromStorage<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
    // filter soft deletions
    return students.filter(s => !s.deleted_at);
  },

  getVisibleStudents(): Student[] {
    const students = this.getStudents();
    const userId = localStorage.getItem('sams_logged_in_id');
    if (userId) {
       const user = this.getSystemUsers().find((u: any) => u.id === userId);
       if (user && user.role === 'secretary' && user.allowed_classes && user.allowed_classes.length > 0) {
           return students.filter(s => user.allowed_classes.includes(s.class_id));
       }
    }
    return students;
  },`;

const getClassesTarget = `  getClasses(): ClassRoom[] {
    return loadFromStorage<ClassRoom[]>(KEYS.CLASSES, INITIAL_CLASSES);
  },`;

const getClassesReplacement = `  getClasses(): ClassRoom[] {
    return loadFromStorage<ClassRoom[]>(KEYS.CLASSES, INITIAL_CLASSES);
  },

  getVisibleClasses(): ClassRoom[] {
    const classes = this.getClasses();
    const userId = localStorage.getItem('sams_logged_in_id');
    if (userId) {
       const user = this.getSystemUsers().find((u: any) => u.id === userId);
       if (user && user.role === 'secretary' && user.allowed_classes && user.allowed_classes.length > 0) {
           return classes.filter(c => user.allowed_classes.includes(c.id));
       }
    }
    return classes;
  },`;

code = code.replace(getStudentsTarget, getStudentsReplacement);
code = code.replace(getClassesTarget, getClassesReplacement);

fs.writeFileSync('src/utils/db.ts', code);
