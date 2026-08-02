const fs = require('fs');
let content = fs.readFileSync('src/components/ClassesManager.tsx', 'utf8');

const targetStr = `    const formattedScheduleTime = daysArr.map(day => \`\${day} (\${classForm.day_times[day]})\`).join(' | ');`;

const replacement = `    const formattedScheduleTime = daysArr.map(day => {
      const rawTime = classForm.day_times[day];
      if (rawTime) {
         const [h, m] = rawTime.split(':');
         const hInt = parseInt(h, 10);
         const ampm = hInt >= 12 ? 'م' : 'ص';
         let h12 = hInt % 12;
         if (h12 === 0) h12 = 12;
         return \`\${day} (\${h12}:\${m} \${ampm})\`;
      }
      return \`\${day} (--)\`;
    }).join(' | ');`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/ClassesManager.tsx', content, 'utf8');
console.log("handleCreateClass AM/PM patched.");
