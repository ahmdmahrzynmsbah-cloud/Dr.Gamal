const fs = require('fs');

const path = './src/components/ClassesManager.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldHeaderStart = '        {/* Top Navigation & Group Header */}';
const oldHeaderEnd = '        </div>\n        {/* Alerts & Messages */}';

const startIndex = content.indexOf(oldHeaderStart);
if (startIndex === -1) {
  console.error('Could not find start index');
  process.exit(1);
}

const endIndex = content.indexOf(oldHeaderEnd, startIndex);
if (endIndex === -1) {
  console.error('Could not find end index');
  process.exit(1);
}

const newHeader = `        {/* Top Navigation & Group Header (Redesigned) */}
        <div className="bg-gradient-to-br from-blue-900/90 via-slate-900 to-slate-900 border border-blue-500/20 rounded-3xl p-5 shadow-xl relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -translate-y-32 translate-x-32"></div>

          {/* Card Header Row */}
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2 mt-2">
                <GraduationCap className="w-6 h-6 text-blue-400" />
                <span>{selectedClassForStudents.name}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {selectedClassForStudents.grade_level}
                </span>
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedClassForStudents(null)}
              className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-xl shrink-0 border border-white/5"
              title="الرجوع إلى قائمة المجموعات"
            >
              <ArrowRight className="w-4 h-4" />
              <span>الرجوع للمجموعات</span>
            </button>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 relative z-10">
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
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-emerald-950/20 transition-all active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة طالب</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const isAlsafa = typeof window !== 'undefined' && localStorage.getItem('sams_active_system') === 'alsafa';
                const centerTitle = isAlsafa ? 'سيستم الصفا للمواد الشرعية' : 'سنتر الدكتور في اللغة العربية';
                const sig = isAlsafa ? '#سيستم الصفا للمواد الشرعية' : '#سيستم الدكتور في اللغة العربية';
                const defaultBroadcastMsg = \`السلام عليكم ورحمة الله وبركاته،\\nأولياء أمور الطلاب الكرام بمجموعة (\${selectedClassForStudents.name}) - \${centerTitle}،\\nتحية طيبة وبعد،\\nنود إحاطتكم بجدول مواعيد المجموعة (\${formatScheduleDisplay(selectedClassForStudents.schedule_time, selectedClassForStudents.schedule_days)}). نرجو التكرم بحث الطلاب على الانضباط والمتابعة المستمرة.\\nشاكرين لكم حسن التعاون.\\n\\n\${sig}\`;
                setGroupWhatsAppMsg(defaultBroadcastMsg);
                setShowGroupWhatsAppModal(true);
              }}
              className="bg-white/15 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs border border-white/10 transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current text-emerald-400" />
              <span>تنبيه واتساب</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPrintRosterModal(true)}
              className="bg-white/15 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs border border-white/10 transition-all active:scale-95 cursor-pointer"
              title="طباعة كشف طلاب المجموعة وتصديره كـ PDF"
            >
              <Printer className="w-4 h-4 text-blue-300" />
              <span>طباعة الكشف</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowArchiveModal(true)}
            className="w-full py-2 text-center text-xs text-blue-200/70 hover:text-blue-100 hover:bg-white/5 rounded-xl mt-2 transition-colors flex items-center justify-center gap-1.5 relative z-10"
            title="عرض الأرشيف والطلاب المؤرشفين"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>الأرشيف ({samsDb.getArchivedStudents().length})</span>
          </button>

          {/* Metadata Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 mt-3 border-t border-white/10 relative z-10">
            <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] text-blue-300/70 font-semibold">المواعيد</span>
                <span className="text-[11px] text-blue-100 font-bold leading-tight">{formatScheduleDisplay(selectedClassForStudents.schedule_time, selectedClassForStudents.schedule_days)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
              <Users className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] text-blue-300/70 font-semibold">إجمالي المقيدين</span>
                <span className="text-[11px] text-blue-100 font-bold leading-tight">{totalStudents} طالب</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[9px] text-emerald-300/70 font-semibold">نسبة الحضور</span>
                <span className="text-[11px] text-emerald-300 font-bold leading-tight">{groupAvgAttendance}%</span>
              </div>
            </div>
          </div>
\n`;

content = content.substring(0, startIndex) + newHeader + content.substring(endIndex);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched header in ClassesManager.tsx');
