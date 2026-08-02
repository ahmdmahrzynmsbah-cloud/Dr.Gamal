const fs = require('fs');

const file = 'src/components/ClassesManager.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetBlock = `            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setNewStudentForm({
                    name: '',
                    phone: '',
                    parent_name: '',
                    parent_phone: '',
                    grade_level: selectedClassForStudents.grade_level || 'الأول الإعدادي',
                    birth_date: '2016-01-01',
                    status: 'active'
                  });
                  setShowAddStudentModal(true);
                }}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة طالب جديد للمجموعة</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const defaultBroadcastMsg = \`السلام عليكم ورحمة الله وبركاته،
أولياء أمور الطلاب الكرام بمجموعة (\${selectedClassForStudents.name}) - سنتر اللغة العربية،
تحية طيبة وبعد،

نود إحاطتكم بجدول مواعيد المجموعة (\${selectedClassForStudents.schedule_days || 'المحددة'} - \${selectedClassForStudents.schedule_time || ''}). نرجو التكرم بحث الطلاب على الانضباط والمتابعة المستمرة.

شاكرين لكم حسن التعاون.\`;
                  setGroupWhatsAppMsg(defaultBroadcastMsg);
                  setShowGroupWhatsAppModal(true);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current text-white" />
                <span>تنبيه واتساب جماعي 📱</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPrintRosterModal(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                title="طباعة كشف طلاب المجموعة وتصديره كـ PDF"
              >
                <Printer className="w-4 h-4 text-slate-950" />
                <span>طباعة كشف المجموعة 📄</span>
              </button>

              <button
                type="button"
                onClick={() => setShowArchiveModal(true)}
                className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
                title="عرض الأرشيف والطلاب المؤرشفين"
              >
                <Archive className="w-4 h-4 text-amber-300" />
                <span>أرشيف الطلاب ({samsDb.getArchivedStudents().length})</span>
              </button>
            </div>`;

const newBlock = `            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto md:justify-end mt-4 md:mt-0">
              <button
                type="button"
                onClick={() => {
                  setNewStudentForm({
                    name: '',
                    phone: '',
                    parent_name: '',
                    parent_phone: '',
                    grade_level: selectedClassForStudents.grade_level || 'الأول الإعدادي',
                    birth_date: '2016-01-01',
                    status: 'active'
                  });
                  setShowAddStudentModal(true);
                }}
                className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[11px] rounded-lg shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer flex-1 md:flex-none justify-center"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>إضافة طالب</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const defaultBroadcastMsg = \`السلام عليكم ورحمة الله وبركاته،
أولياء أمور الطلاب الكرام بمجموعة (\${selectedClassForStudents.name}) - سنتر اللغة العربية،
تحية طيبة وبعد،

نود إحاطتكم بجدول مواعيد المجموعة (\${selectedClassForStudents.schedule_days || 'المحددة'} - \${selectedClassForStudents.schedule_time || ''}). نرجو التكرم بحث الطلاب على الانضباط والمتابعة المستمرة.

شاكرين لكم حسن التعاون.\`;
                  setGroupWhatsAppMsg(defaultBroadcastMsg);
                  setShowGroupWhatsAppModal(true);
                }}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer flex-1 md:flex-none justify-center"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current text-white" />
                <span>تنبيه واتساب</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPrintRosterModal(true)}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] rounded-lg shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer flex-1 md:flex-none justify-center"
                title="طباعة كشف طلاب المجموعة وتصديره كـ PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-950" />
                <span>طباعة الكشف</span>
              </button>

              <button
                type="button"
                onClick={() => setShowArchiveModal(true)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] rounded-lg border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer flex-1 md:flex-none justify-center"
                title="عرض الأرشيف والطلاب المؤرشفين"
              >
                <Archive className="w-3.5 h-3.5 text-amber-300" />
                <span>الأرشيف ({samsDb.getArchivedStudents().length})</span>
              </button>
            </div>`;

content = content.replace(targetBlock, newBlock);
fs.writeFileSync(file, content, 'utf8');
console.log("Updated Quick Actions block");
