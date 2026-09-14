const fs = require('fs');

const path = './src/components/ClassesManager.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldHeaderStart = '{/* Card Header Row */}';
const oldHeaderEnd = '</div>\n        </div>\n        \n        {/* Alerts & Messages */}';
const oldHeaderEndAlt = '</div>\n        </div>\n        {/* Alerts & Messages */}'; // in case of different spaces

let startIndex = content.indexOf(oldHeaderStart);
if (startIndex === -1) {
  console.log("Could not find start");
  process.exit(1);
}

let endIndex = content.indexOf('        {/* Alerts & Messages */}', startIndex);
if (endIndex === -1) {
  console.log("Could not find end");
  process.exit(1);
}

const newHeaderSection = `{/* Card Header Row */}
          <div className="flex items-center justify-between gap-2 mb-4 relative z-10 w-full">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 shrink-0" />
              <h2 className="text-sm sm:text-xl font-extrabold text-white truncate">
                {selectedClassForStudents.name}
              </h2>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] sm:text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0 whitespace-nowrap">
                {selectedClassForStudents.grade_level}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedClassForStudents(null)}
              className="flex items-center gap-1 text-[10px] sm:text-xs text-blue-200 hover:text-white transition-colors bg-white/10 px-2 sm:px-3 py-1.5 rounded-lg shrink-0 border border-white/5"
              title="الرجوع إلى قائمة المجموعات"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>رجوع</span>
            </button>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-4 relative z-10">
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
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs shadow-md shadow-emerald-950/20 transition-all active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">إضافة</span>
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
              className="bg-white/15 hover:bg-white/20 text-white font-bold py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs border border-white/10 transition-all active:scale-95 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current text-emerald-400 shrink-0" />
              <span className="truncate">تنبيه</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPrintRosterModal(true)}
              className="bg-white/15 hover:bg-white/20 text-white font-bold py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-xs border border-white/10 transition-all active:scale-95 cursor-pointer"
              title="طباعة كشف طلاب المجموعة وتصديره كـ PDF"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-300 shrink-0" />
              <span className="truncate">طباعة</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowArchiveModal(true)}
            className="w-full py-1.5 text-center text-[10px] sm:text-xs text-blue-200/70 hover:text-blue-100 hover:bg-white/5 rounded-lg mt-1.5 transition-colors flex items-center justify-center gap-1.5 relative z-10"
            title="عرض الأرشيف والطلاب المؤرشفين"
          >
            <Archive className="w-3 h-3" />
            <span>الأرشيف ({samsDb.getArchivedStudents().length})</span>
          </button>

          {/* Metadata Chips */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2.5 mt-2.5 border-t border-white/10 relative z-10">
            <div className="flex flex-col items-center justify-center gap-0.5 bg-black/20 py-1.5 px-1 rounded-lg text-center">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] text-blue-100 font-bold truncate w-full">{formatScheduleDisplay(selectedClassForStudents.schedule_time, selectedClassForStudents.schedule_days)}</span>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-0.5 bg-black/20 py-1.5 px-1 rounded-lg text-center">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] text-blue-100 font-bold truncate w-full">{totalStudents} طالب</span>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-0.5 bg-black/20 py-1.5 px-1 rounded-lg text-center">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-emerald-300 font-bold truncate w-full">{groupAvgAttendance}%</span>
            </div>
          </div>
        </div>
`;

content = content.substring(0, startIndex) + newHeaderSection + "\n" + content.substring(endIndex);
fs.writeFileSync(path, content, 'utf8');
console.log('Fixed ClassesManager layout for mobile');

