const fs = require('fs');
let content = fs.readFileSync('src/components/ClassesManager.tsx', 'utf8');

// Update classForm definition
const classFormDef = `  const [classForm, setClassForm] = useState({
    name: '',
    schedule_days: '',
    schedule_time: '',
    grade_level: 'الأول الإعدادي'
  });`;

const newClassFormDef = `  const [classForm, setClassForm] = useState({
    name: '',
    schedule_days: '',
    schedule_time: '',
    day_times: {} as Record<string, string>,
    grade_level: 'الأول الإعدادي'
  });`;

content = content.replace(classFormDef, newClassFormDef);
fs.writeFileSync('src/components/ClassesManager.tsx', content, 'utf8');
console.log("Class form definition patched.");
