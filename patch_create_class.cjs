const fs = require('fs');
let content = fs.readFileSync('src/components/ClassesManager.tsx', 'utf8');

const targetStr = `    if (!classForm.schedule_days || classForm.schedule_days.trim() === '') {
      setErrorText('يرجى تحديد أيام المجموعة الدراسية.');
      return;
    }
    if (!classForm.schedule_time || classForm.schedule_time.trim() === '') {
      setErrorText('يرجى تحديد وقت المجموعة الدراسية.');
      return;
    }
    if (!classForm.grade_level) {
      setErrorText('يرجى تحديد الصف الدراسي للمجموعة.');
      return;
    }

    const newCls: ClassRoom = {
      id: \`c-\${Date.now()}\`,
      name: classForm.name,
      schedule_days: classForm.schedule_days,
      schedule_time: classForm.schedule_time,
      capacity: 0,
      grade_level: classForm.grade_level
    };

    samsDb.addClass(newCls);
    setClassForm({
      name: '',
      schedule_days: '',
      schedule_time: '',
      grade_level: 'الأول الإعدادي'
    });`;

const replacement = `    if (!classForm.schedule_days || classForm.schedule_days.trim() === '') {
      setErrorText('يرجى تحديد أيام المجموعة الدراسية.');
      return;
    }
    const daysArr = classForm.schedule_days.split('، ').filter(Boolean);
    const missingTimes = daysArr.some(day => !classForm.day_times[day] || classForm.day_times[day].trim() === '');
    if (missingTimes) {
      setErrorText('يرجى تحديد وقت المجموعة لكل يوم تم اختياره.');
      return;
    }
    
    if (!classForm.grade_level) {
      setErrorText('يرجى تحديد الصف الدراسي للمجموعة.');
      return;
    }

    const formattedScheduleTime = daysArr.map(day => \`\${day} (\${classForm.day_times[day]})\`).join(' | ');

    const newCls: ClassRoom = {
      id: \`c-\${Date.now()}\`,
      name: classForm.name,
      schedule_days: classForm.schedule_days,
      schedule_time: formattedScheduleTime,
      capacity: 0,
      grade_level: classForm.grade_level
    };

    samsDb.addClass(newCls);
    setClassForm({
      name: '',
      schedule_days: '',
      schedule_time: '',
      day_times: {},
      grade_level: 'الأول الإعدادي'
    });`;

content = content.replace(targetStr, replacement);
fs.writeFileSync('src/components/ClassesManager.tsx', content, 'utf8');
console.log("handleCreateClass patched.");
