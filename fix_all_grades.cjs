const fs = require('fs');

const gradesArray = [
  "الصف الأول الإبتدائي",
  "الصف الثاني الإبتدائي",
  "الصف الثالث الإبتدائي",
  "الصف الرابع الإبتدائي",
  "الصف الخامس الإبتدائي",
  "الصف السادس الإبتدائي",
  "الأول الإعدادي",
  "الثاني الإعدادي",
  "الثالث الإعدادي",
  "الأول الثانوي",
  "الثاني الثانوي",
  "الثالث الثانوي"
];

const stringifiedGrades = JSON.stringify(gradesArray);

const filesToUpdate = ['src/components/FeesTracker.tsx', 'src/components/StudentsList.tsx', 'src/components/ClassesManager.tsx'];

// 1. FeesTracker.tsx
let feesContent = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');
const oldGradesArrayStr = "['الأول الإعدادي', 'الثاني الإعدادي', 'الثالث الإعدادي', 'الأول الثانوي', 'الثاني الثانوي', 'الثالث الثانوي']";
if (feesContent.includes(oldGradesArrayStr)) {
    feesContent = feesContent.replace(oldGradesArrayStr, stringifiedGrades.replace(/"/g, "'"));
    fs.writeFileSync('src/components/FeesTracker.tsx', feesContent, 'utf8');
    console.log("Patched FeesTracker.tsx");
}

// 2. StudentsList.tsx
let studentsContent = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');
const oldSelect = `<option value="الأول الإعدادي">الأول الإعدادي</option>
                    <option value="الثاني الإعدادي">الثاني الإعدادي</option>
                    <option value="الثالث الإعدادي">الثالث الإعدادي</option>
                    <option value="الأول الثانوي">الأول الثانوي</option>
                    <option value="الثاني الثانوي">الثاني الثانوي</option>
                    <option value="الثالث الثانوي">الثالث الثانوي</option>`;
const newSelect = gradesArray.map(g => `<option value="${g}">${g}</option>`).join('\n                    ');
if (studentsContent.includes(oldSelect)) {
    studentsContent = studentsContent.replace(oldSelect, newSelect);
    fs.writeFileSync('src/components/StudentsList.tsx', studentsContent, 'utf8');
    console.log("Patched StudentsList.tsx");
}

// 3. ClassesManager.tsx
let classesContent = fs.readFileSync('src/components/ClassesManager.tsx', 'utf8');
if (classesContent.includes(oldSelect)) {
    classesContent = classesContent.replace(oldSelect, newSelect);
    fs.writeFileSync('src/components/ClassesManager.tsx', classesContent, 'utf8');
    console.log("Patched ClassesManager.tsx");
}

