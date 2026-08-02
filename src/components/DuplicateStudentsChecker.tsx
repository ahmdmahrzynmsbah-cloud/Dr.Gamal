import React, { useMemo, useState } from 'react';
import { Student } from '../types';
import { samsDb } from '../utils/db';
import { Users, Trash2, X, Phone, User, Check, ArrowRight, Merge, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface DuplicateStudentsCheckerProps {
  students: Student[];
  onClose: () => void;
  onRefresh: () => void;
}

export default function DuplicateStudentsChecker({ students, onClose, onRefresh }: DuplicateStudentsCheckerProps) {
  const [successMsg, setSuccessMsg] = useState('');

  const duplicates = useMemo(() => {
    const groups: {
      id: string;
      type: string;
      value: string;
      students: Student[];
    }[] = [];

    const groupedByPhone: Record<string, Student[]> = {};
    const groupedByParentPhone: Record<string, Student[]> = {};
    const groupedByName: Record<string, Student[]> = {};

    students.forEach(s => {
      if (s.phone && s.phone.trim() !== '') {
        const val = s.phone.trim();
        if (!groupedByPhone[val]) groupedByPhone[val] = [];
        groupedByPhone[val].push(s);
      }
      if (s.parent_phone && s.parent_phone.trim() !== '') {
        const val = s.parent_phone.trim();
        if (!groupedByParentPhone[val]) groupedByParentPhone[val] = [];
        groupedByParentPhone[val].push(s);
      }
      if (s.name && s.name.trim() !== '') {
        const val = s.name.trim();
        if (!groupedByName[val]) groupedByName[val] = [];
        groupedByName[val].push(s);
      }
    });

    let counter = 0;
    
    // Helper to check if a group is already somewhat represented to avoid too much noise,
    // but for safety we can just list them all.
    Object.keys(groupedByName).forEach(val => {
      if (groupedByName[val].length > 1) {
        groups.push({ id: `name-${counter++}`, type: 'تطابق في الاسم', value: val, students: groupedByName[val] });
      }
    });

    Object.keys(groupedByPhone).forEach(val => {
      if (groupedByPhone[val].length > 1) {
        groups.push({ id: `phone-${counter++}`, type: 'تطابق هاتف الطالب', value: val, students: groupedByPhone[val] });
      }
    });
    
    Object.keys(groupedByParentPhone).forEach(val => {
      if (groupedByParentPhone[val].length > 1) {
        groups.push({ id: `parent-${counter++}`, type: 'تطابق هاتف ولي الأمر', value: val, students: groupedByParentPhone[val] });
      }
    });

    return groups;
  }, [students]);

  const handleMerge = (keepId: string, groupStudents: Student[]) => {
    const deleteIds = groupStudents.filter(s => s.id !== keepId).map(s => s.id);
    if (confirm(`هل أنت متأكد من دمج هذه السجلات؟ سيتم الاحتفاظ بطالب واحد وحذف (${deleteIds.length}) مع دمج السجلات المرتبطة بهم (الغياب، المصروفات، إلخ).`)) {
      samsDb.mergeStudents(keepId, deleteIds);
      setSuccessMsg('تم دمج السجلات بنجاح!');
      setTimeout(() => setSuccessMsg(''), 3000);
      onRefresh();
    }
  };

  const handleDeleteOthers = (keepId: string, groupStudents: Student[]) => {
    const deleteIds = groupStudents.filter(s => s.id !== keepId).map(s => s.id);
    if (confirm(`هل أنت متأكد من حذف النسخ المكررة فقط؟ سيتم حذف (${deleteIds.length}) طلاب نهائياً دون دمج السجلات.`)) {
      deleteIds.forEach(id => samsDb.permanentlyDeleteStudent(id));
      setSuccessMsg('تم حذف النسخ المكررة بنجاح!');
      setTimeout(() => setSuccessMsg(''), 3000);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer flex items-center gap-2 font-bold text-sm"
          >
            <ArrowRight className="w-5 h-5" />
            <span>رجوع</span>
          </button>
          <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              فحص البيانات المكررة
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              اكتشاف ودمج الطلاب المكررين للحفاظ على نظافة قاعدة البيانات
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl font-bold flex items-center gap-2 border border-emerald-200">
          <Check className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      {duplicates.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">قاعدة البيانات نظيفة</h3>
          <p className="text-slate-500 dark:text-slate-400">لم يتم العثور على أي بيانات مكررة (أسماء أو أرقام هواتف متطابقة).</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-amber-50 text-amber-800 p-4 rounded-xl font-bold flex items-start gap-3 border border-amber-200">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p>تم العثور على {duplicates.length} مجموعة من البيانات المكررة.</p>
              <p className="text-sm font-normal mt-1 opacity-90">يمكنك الاحتفاظ بطالب واحد و <strong>دمج</strong> الباقي (سيتم نقل الغياب والدرجات للطالب المحتفظ به) أو <strong>حذف</strong> الباقي مباشرة.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {duplicates.map((group) => (
              <div key={group.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 mr-2">
                      {group.type}
                    </span>
                    <strong className="text-lg text-slate-800 dark:text-slate-100 ml-2">{group.value}</strong>
                  </div>
                  <div className="text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full">
                    {group.students.length} سجلات متطابقة
                  </div>
                </div>

                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                      <thead className="text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700">
                        <tr>
                          <th className="pb-3 px-2">الاسم</th>
                          <th className="pb-3 px-2">رقم القيد</th>
                          <th className="pb-3 px-2">الهاتف</th>
                          <th className="pb-3 px-2">تاريخ الإضافة</th>
                          <th className="pb-3 px-2 text-center">إجراء (للاحتفاظ به)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {group.students.map(s => (
                          <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-3 px-2 font-bold text-slate-800 dark:text-slate-100">{s.name}</td>
                            <td className="py-3 px-2 font-mono text-slate-600 dark:text-slate-300">{s.registration_id}</td>
                            <td className="py-3 px-2 font-mono text-slate-600 dark:text-slate-300">{s.phone || '-'}</td>
                            <td className="py-3 px-2 text-slate-500 text-xs">{new Date(s.created_at).toLocaleDateString('ar-EG')}</td>
                            <td className="py-3 px-2 text-center space-x-2 space-x-reverse">
                              <button
                                onClick={() => handleMerge(s.id, group.students)}
                                className="px-3 py-1.5 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors"
                                title="الاحتفاظ بهذا السجل ودمج الباقي إليه"
                              >
                                <Merge className="w-3.5 h-3.5" />
                                دمج وحفظ هذا
                              </button>
                              <button
                                onClick={() => handleDeleteOthers(s.id, group.students)}
                                className="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors"
                                title="الاحتفاظ بهذا السجل وحذف الباقي نهائياً"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                حذف الآخرين
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
