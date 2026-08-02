const fs = require('fs');

const gradesArray = [
  'الأول الإعدادي', 'الثاني الإعدادي', 'الثالث الإعدادي', 'الأول الثانوي', 'الثاني الثانوي', 'الثالث الثانوي'
];

const gradeOptionsHtml = `
                <option value="الأول الإعدادي">الأول الإعدادي</option>
                <option value="الثاني الإعدادي">الثاني الإعدادي</option>
                <option value="الثالث الإعدادي">الثالث الإعدادي</option>
                <option value="الأول الثانوي">الأول الثانوي</option>
                <option value="الثاني الثانوي">الثاني الثانوي</option>
                <option value="الثالث الثانوي">الثالث الثانوي</option>
`;

// 1. FeesTracker.tsx
try {
  let ftContent = fs.readFileSync('src/components/FeesTracker.tsx', 'utf8');
  const targetToReplace = `["الأول الإبتدائي","الثاني الإبتدائي","الثالث الإبتدائي","الرابع الإبتدائي","الخامس الإبتدائي","السادس الإبتدائي","الأول الإعدادي","الثاني الإعدادي","الثالث الإعدادي","الأول الثانوي","الثاني الثانوي","الثالث الثانوي"]`;
  ftContent = ftContent.replace(targetToReplace, JSON.stringify(gradesArray));
  fs.writeFileSync('src/components/FeesTracker.tsx', ftContent, 'utf8');
} catch (e) {
  console.log('Error in FeesTracker', e);
}

// 2. ClassesManager.tsx
try {
  let cmContent = fs.readFileSync('src/components/ClassesManager.tsx', 'utf8');
  cmContent = cmContent.replace(/<option value="الأول الإبتدائي">الأول الإبتدائي<\/option>\s*<option value="الثاني الإبتدائي">الثاني الإبتدائي<\/option>\s*<option value="الثالث الإبتدائي">الثالث الإبتدائي<\/option>\s*<option value="الرابع الإبتدائي">الرابع الإبتدائي<\/option>\s*<option value="الخامس الإبتدائي">الخامس الإبتدائي<\/option>\s*<option value="السادس الإبتدائي">السادس الإبتدائي<\/option>\s*<option value="الأول الإبتدائي">الأول الإبتدائي<\/option>\s*<option value="الثاني الإبتدائي">الثاني الإبتدائي<\/option>\s*<option value="الثالث الإبتدائي">الثالث الإبتدائي<\/option>/g, '');
  
  // Actually, I can just replace the whole block of 12 options back to 6.
  const regex = /<option value="الأول الإبتدائي">الأول الإبتدائي<\/option>\s*<option value="الثاني الإبتدائي">الثاني الإبتدائي<\/option>\s*<option value="الثالث الإبتدائي">الثالث الإبتدائي<\/option>\s*<option value="الرابع الإبتدائي">الرابع الإبتدائي<\/option>\s*<option value="الخامس الإبتدائي">الخامس الإبتدائي<\/option>\s*<option value="السادس الإبتدائي">السادس الإبتدائي<\/option>\s*<option value="الأول الإعدادي">الأول الإعدادي<\/option>\s*<option value="الثاني الإعدادي">الثاني الإعدادي<\/option>\s*<option value="الثالث الإعدادي">الثالث الإعدادي<\/option>\s*<option value="الأول الثانوي">الأول الثانوي<\/option>\s*<option value="الثاني الثانوي">الثاني الثانوي<\/option>\s*<option value="الثالث الثانوي">الثالث الثانوي<\/option>/g;
  
  cmContent = cmContent.replace(regex, gradeOptionsHtml.trim());
  fs.writeFileSync('src/components/ClassesManager.tsx', cmContent, 'utf8');
} catch(e) {
  console.log('Error in ClassesManager', e);
}

// 3. StudentsList.tsx
try {
  let slContent = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');
  const regex = /<option value="الأول الإبتدائي">الأول الإبتدائي<\/option>\s*<option value="الثاني الإبتدائي">الثاني الإبتدائي<\/option>\s*<option value="الثالث الإبتدائي">الثالث الإبتدائي<\/option>\s*<option value="الرابع الإبتدائي">الرابع الإبتدائي<\/option>\s*<option value="الخامس الإبتدائي">الخامس الإبتدائي<\/option>\s*<option value="السادس الإبتدائي">السادس الإبتدائي<\/option>\s*<option value="الأول الإعدادي">الأول الإعدادي<\/option>\s*<option value="الثاني الإعدادي">الثاني الإعدادي<\/option>\s*<option value="الثالث الإعدادي">الثالث الإعدادي<\/option>\s*<option value="الأول الثانوي">الأول الثانوي<\/option>\s*<option value="الثاني الثانوي">الثاني الثانوي<\/option>\s*<option value="الثالث الثانوي">الثالث الثانوي<\/option>/g;
  slContent = slContent.replace(regex, gradeOptionsHtml.trim().split('\\n').map(l => '  ' + l).join('\\n'));
  fs.writeFileSync('src/components/StudentsList.tsx', slContent, 'utf8');
} catch(e) {
  console.log('Error in StudentsList', e);
}

