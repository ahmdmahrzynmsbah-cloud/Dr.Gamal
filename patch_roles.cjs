const fs = require('fs');
let content = fs.readFileSync('src/components/SystemRoles.tsx', 'utf8');

const target = `  const availableTabs = [
    { id: 'dashboard', label: 'لوحة التحكم والمؤشرات' },
    { id: 'students', label: 'إدارة الطلاب والقبول' },
    { id: 'parents', label: 'إدارة أولياء الأمور' },
    { id: 'barcodes', label: 'باركود الطلاب' },
    { id: 'attendance', label: 'الحضور والانتظام اليومي' },
    { id: 'exams', label: 'الامتحانات والواجبات' },
    { id: 'classes', label: 'المجموعات والجدول والمقررات' },
    { id: 'fees', label: 'اشتراكات الشهر والحسابات' },
    { id: 'notifications', label: 'بث الرسائل وتواصل الآباء' },
    { id: 'roles', label: 'الصلاحيات وتدقيق الأمان' },
  ];`;

const replacement = `  const availableTabs = [
    { id: 'dashboard', label: 'لوحة التحكم والمؤشرات' },
    { id: 'students', label: 'إدارة الطلاب والقبول' },
    { id: 'parents', label: 'إدارة أولياء الأمور' },
    { id: 'barcodes', label: 'باركود الطلاب' },
    { id: 'attendance', label: 'الحضور والانتظام اليومي' },
    { id: 'exams', label: 'الامتحانات والواجبات' },
    { id: 'classes', label: 'المجموعات والجدول والمقررات' },
    { id: 'fees', label: 'اشتراكات الشهر والحسابات' },
    { id: 'salaries', label: 'المرتبات والمصروفات' },
    { id: 'notifications', label: 'بث الرسائل وتواصل الآباء' },
    { id: 'roles', label: 'الصلاحيات وتدقيق الأمان' },
    { id: 'audit', label: 'سجل المعاملات الحية' },
    { id: 'settings', label: 'إعدادات المنصة' },
    { id: 'privacy', label: 'سياسة الخصوصية' }
  ];`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/components/SystemRoles.tsx', content, 'utf8');
    console.log("Patched SystemRoles.tsx");
} else {
    console.log("Could not find target in SystemRoles.tsx");
}
