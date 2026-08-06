const fs = require('fs');
let content = fs.readFileSync('src/components/StudentsList.tsx', 'utf8');

// Update confirmDelete to soft delete
content = content.replace(
  /handleProcessAction\("جاري الحذف النهائي\.\.\.", \(\) => \{\s*samsDb\.permanentlyDeleteStudent\(studentToDelete\.id\);\s*setSuccessMessage\('تم حذف الطالب نهائياً بنجاح\.'\);/g,
  `handleProcessAction("جاري أرشفة الطالب...", () => {\n        samsDb.softDeleteStudent(studentToDelete.id);\n        setSuccessMessage('تم أرشفة الطالب بنجاح.');`
);

// Update icon in table
content = content.replace(
  /<button onClick=\{\(\) => handleDeleteClick\(student\)\} className="p-1\.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900\/40 rounded-lg transition-colors cursor-pointer" title="حذف الطالب">\s*<Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" \/>\s*<\/button>/g,
  `<button onClick={() => handleDeleteClick(student)} className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/40 rounded-lg transition-colors cursor-pointer" title="أرشفة الطالب">\n                          <Archive className="w-4 h-4 text-orange-600 dark:text-orange-400" />\n                        </button>`
);

// Update modal
content = content.replace(
  /<div className="flex items-center gap-3 text-red-600 dark:text-red-400">\s*<div className="p-3 bg-red-50 dark:bg-red-900\/40 rounded-2xl">\s*<Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" \/>\s*<\/div>\s*<div>\s*<h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50">تأكيد حذف الطالب<\/h3>\s*<p className="text-xs text-slate-500 dark:text-slate-400 font-sans">حذف سجل الطالب نهائياً من السنتر<\/p>\s*<\/div>\s*<\/div>/g,
  `<div className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/40 rounded-2xl">
                  <Archive className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-50">تأكيد أرشفة الطالب</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">نقل سجل الطالب إلى الأرشيف</p>
                </div>
              </div>`
);

content = content.replace(
  /<p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans bg-red-50\/50 p-3\.5 rounded-xl border border-red-100 dark:border-red-800">\s*هل أنت متأكد من رغبتك في حذف الطالب <strong className="text-slate-900 dark:text-slate-50">"\{studentToDelete\.name\}"<\/strong> نهائياً؟ سيتم مسح كافة بياناته ولن تتمكن من استعادتها\.\s*<\/p>/g,
  `<p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans bg-orange-50/50 dark:bg-orange-900/20 p-3.5 rounded-xl border border-orange-100 dark:border-orange-800">
                هل أنت متأكد من رغبتك في أرشفة الطالب <strong className="text-slate-900 dark:text-slate-50">"{studentToDelete.name}"</strong>؟ سيتم نقله إلى الأرشيف ولن يظهر في القوائم النشطة.
              </p>`
);

content = content.replace(
  /className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-colors cursor-pointer"\s*>\s*تأكيد الحذف النهائي 🗑️\s*<\/button>/g,
  `className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black transition-colors cursor-pointer"
                >
                  تأكيد الأرشفة 📦
                </button>`
);

fs.writeFileSync('src/components/StudentsList.tsx', content, 'utf8');

