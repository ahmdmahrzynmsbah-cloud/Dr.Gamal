const fs = require('fs');

const targetGrades = `['الأول الإعدادي', 'الثاني الإعدادي', 'الثالث الإعدادي', 'الأول الثانوي', 'الثاني الثانوي', 'الثالث الثانوي']`;
const htmlGrades = `
                <option value="الأول الإعدادي">الأول الإعدادي</option>
                <option value="الثاني الإعدادي">الثاني الإعدادي</option>
                <option value="الثالث الإعدادي">الثالث الإعدادي</option>
                <option value="الأول الثانوي">الأول الثانوي</option>
                <option value="الثاني الثانوي">الثاني الثانوي</option>
                <option value="الثالث الثانوي">الثالث الثانوي</option>`;

['src/components/FeesTracker.tsx', 'src/components/ClassesManager.tsx', 'src/components/StudentsList.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace array
  content = content.replace(/\[\s*"الأول الإبتدائي".*?"الثالث الثانوي"\s*\]/, targetGrades);
  
  // Replace HTML options
  const regex = /<option value="الأول الإبتدائي">.*?<\/option>.*?<option value="الثالث الثانوي">.*?<\/option>/gs;
  content = content.replace(regex, htmlGrades.trim());
  
  // Double check if there are left over options because of slightly different formatting
  const regex2 = /<option value="الأول الإبتدائي">.*?<\/option>.*?<option value="الثالث الإبتدائي">.*?<\/option>/gs;
  content = content.replace(regex2, '');

  fs.writeFileSync(file, content, 'utf8');
});
