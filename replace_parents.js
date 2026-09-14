const fs = require('fs');

const path = './src/components/ParentsList.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetContent = `        {/* Database Grid */}
        <div className="overflow-x-auto max-h-[65vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-xs">
          <table className="min-w-full text-right relative border-collapse" dir="rtl">`;

const newContent = `        {/* Mobile Cards View */}
        <div className="block md:hidden space-y-3">
          {filteredParents.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-bold bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
              لا يوجد نتائج مطابقة لاستعلام الفرز الحالي لأولياء الأمور.
            </div>
          ) : (
            filteredParents.map(parent => (
              <div key={parent.id} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-[#0D5C8C]/10 flex items-center justify-center text-[#0D5C8C] shrink-0 font-bold">
                      {parent.parent_name[0] || 'و'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">{parent.parent_name}</div>
                      {parent.children.length > 1 && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/40 border border-amber-100 dark:border-amber-800 px-1.5 py-0.5 rounded-sm">
                          <Users className="w-2.5 h-2.5" />
                          رابط أشقاء عائلي
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800 px-2 py-1 rounded-full whitespace-nowrap h-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    تواصل فعال
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-bold">الطلاب التابعين (الأبناء):</div>
                  <div className="flex flex-wrap gap-1.5">
                    {parent.children.map(child => (
                      <span 
                        key={child.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-sky-50 dark:bg-sky-900/40 text-[#0D5C8C] border border-sky-100 dark:border-sky-800 rounded-lg font-bold text-[10px] shadow-3xs"
                      >
                        {child.name} <span className="text-slate-400 font-semibold font-sans">({child.grade_level})</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                  <div className="font-mono text-sm text-slate-600 dark:text-slate-300">
                    {parent.parent_phone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#0D5C8C]" />
                        <span dir="ltr">{parent.parent_phone}</span>
                      </span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/40 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-800 text-xs">⚠️ غير متوفر</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <a
                      href={parent.parent_phone ? \`sms:\${parent.parent_phone}?body=\${encodeURIComponent(\`السلام عليكم ورحمة الله وبركاته،\\nالسيد ولي أمر الطالب/ة: (\${(parent as any).student_names?.join(' - ') || ''})\\nتحية طيبة وبعد من \${typeof window !== 'undefined' && localStorage.getItem('sams_active_system') === 'alsafa' ? 'سيستم الصفا للمواد الشرعية' : 'سنتر الدكتور في اللغة العربية'}...\\n\\n\${typeof window !== 'undefined' && localStorage.getItem('sams_active_system') === 'alsafa' ? '#سيستم الصفا للمواد الشرعية' : '#سيستم الدكتور في اللغة العربية'}\`)}\` : '#'}
                      title="إرسال رسالة نصية SMS"
                      className={\`p-2 rounded-lg transition-colors cursor-pointer \${
                        parent.parent_phone 
                          ? 'text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/40 hover:text-sky-700' 
                          : 'text-slate-300 pointer-events-none'
                      }\`}
                    >
                      <Smartphone className="w-4 h-4" />
                    </a>
                    <a
                      href={parent.parent_phone ? \`https://wa.me/\${parent.parent_phone.startsWith('0') ? '2' + parent.parent_phone : parent.parent_phone}?text=\${encodeURIComponent(\`السلام عليكم ورحمة الله وبركاته،\\nالسيد ولي أمر الطالب/ة: (\${(parent as any).student_names?.join(' - ') || ''})\\nتحية طيبة وبعد من \${typeof window !== 'undefined' && localStorage.getItem('sams_active_system') === 'alsafa' ? 'سيستم الصفا للمواد الشرعية' : 'سنتر الدكتور في اللغة العربية'}...\\n\\n\${typeof window !== 'undefined' && localStorage.getItem('sams_active_system') === 'alsafa' ? '#سيستم الصفا للمواد الشرعية' : '#سيستم الدكتور في اللغة العربية'}\`)}\` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="مراسلة سريعة عبر الواتساب"
                      className={\`p-2 rounded-lg transition-colors cursor-pointer \${
                        parent.parent_phone 
                          ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 hover:text-emerald-700' 
                          : 'text-slate-300 pointer-events-none'
                      }\`}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleEditClick(parent)}
                      title="تعديل بيانات ولي الأمر والتواصل"
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#0D5C8C] hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Database Grid */}
        <div className="hidden md:block overflow-x-auto max-h-[65vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-xs">
          <table className="min-w-full text-right relative border-collapse" dir="rtl">`;

content = content.replace(targetContent, newContent);
fs.writeFileSync(path, content, 'utf8');
