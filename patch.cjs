const fs = require('fs');
let code = fs.readFileSync('src/components/SystemRoles.tsx', 'utf8');

const replacement = `                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">* إذا لم تقم بتحديد أي صفحات، فسيتم تطبيق الصلاحيات الافتراضية الخاصة بالدور المختار.</p>
            </div>

            {formData.role === 'secretary' && classes.length > 0 && (
              <div className="md:col-span-3 mt-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  المجموعات المسموح بإدارتها (للسكرتارية)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {classes.map(cls => {
                    const isSelected = formData.allowed_classes?.includes(cls.id);
                    return (
                      <div 
                        key={cls.id}
                        onClick={() => handleToggleAllowedClass(cls.id)}
                        className={\`cursor-pointer p-3 rounded-xl border flex items-center justify-between gap-2 transition-all \${
                          isSelected 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }\`}
                      >
                        <span className="text-xs font-bold leading-tight flex-1">{cls.name} ({cls.grade_level})</span>
                        <div className={\`w-4 h-4 rounded-full border shrink-0 flex items-center justify-center \${
                          isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300 dark:border-slate-600'
                        }\`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">* إذا لم تقم بتحديد أي مجموعات، سيكون مسموحاً لها برؤية جميع المجموعات.</p>
              </div>
            )}

            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}`;

const target = `                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">* إذا لم تقم بتحديد أي صفحات، فسيتم تطبيق الصلاحيات الافتراضية الخاصة بالدور المختار.</p>
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/SystemRoles.tsx', code);
