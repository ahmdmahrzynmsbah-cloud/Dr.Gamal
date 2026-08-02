const fs = require('fs');
let content = fs.readFileSync('src/components/ClassesManager.tsx', 'utf8');

const targetUI = `            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 font-sans">وقت المجموعة *</label>
              <input
                type="text"
                value={classForm.schedule_time}
                onChange={(e) => setClassForm({ ...classForm, schedule_time: e.target.value })}
                className="w-full text-xs font-sans border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg focus:outline-hidden focus:border-[#0D5C8C] text-right bg-white dark:bg-slate-800"
                placeholder="أدخل وقت المواعيد..."
                required
              />
            </div>`;

const newUI = `            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 font-sans">أوقات المجموعة للأيام المحددة *</label>
              {(classForm.schedule_days ? classForm.schedule_days.split('، ').filter(Boolean) : []).length === 0 ? (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                  الرجاء تحديد أيام المجموعة أولاً...
                </div>
              ) : (
                <div className="flex flex-col gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                  {(classForm.schedule_days ? classForm.schedule_days.split('، ').filter(Boolean) : []).map(day => (
                    <div key={day} className="flex items-center gap-3">
                      <span className="w-16 text-xs font-bold text-slate-700 dark:text-slate-200">{day}</span>
                      <input
                        type="time"
                        value={classForm.day_times?.[day] || ''}
                        onChange={(e) => {
                          setClassForm(prev => ({
                            ...prev,
                            day_times: {
                              ...prev.day_times,
                              [day]: e.target.value
                            }
                          }));
                        }}
                        className="flex-1 text-xs font-sans border border-slate-200 dark:border-slate-700 p-2 rounded-lg focus:outline-hidden focus:border-[#0D5C8C] text-right bg-white dark:bg-slate-900"
                        required
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>`;

content = content.replace(targetUI, newUI);
fs.writeFileSync('src/components/ClassesManager.tsx', content, 'utf8');
console.log("UI days patched.");
