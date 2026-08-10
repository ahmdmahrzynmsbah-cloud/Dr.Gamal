const fs = require('fs');
let code = fs.readFileSync('src/components/SystemRoles.tsx', 'utf8');

const target = `<label className="block text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  المجموعات المسموح بإدارتها (للسكرتارية)
                </label>`;

const replacement = `<div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    المجموعات المسموح بإدارتها (للسكرتارية)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.allowed_classes?.length === classes.length) {
                        setFormData({ ...formData, allowed_classes: [] });
                      } else {
                        setFormData({ ...formData, allowed_classes: classes.map(c => c.id) });
                      }
                    }}
                    className="text-xs font-bold text-[#0D5C8C] hover:text-[#1A7FAA] bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/30 dark:hover:bg-sky-900/50 px-3 py-1 rounded-lg transition-colors"
                  >
                    {formData.allowed_classes?.length === classes.length ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                  </button>
                </div>`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/SystemRoles.tsx', code);
