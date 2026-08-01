/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Image, MessageSquare, Key, Save, RefreshCw, LogOut, HelpCircle, CheckCircle2, Moon, Sun, Palette, Volume2, VolumeX, Bell, Play, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { playNotificationTone, NotificationTone, TONE_OPTIONS } from '../utils/audioAlerts';

interface SettingsManagerProps {
  onSettingsSaved: () => void;
  onLogout: () => void;
  userRole: string;
  userName: string;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function SettingsManager({ onSettingsSaved, onLogout, userRole, userName, isDarkMode = false, onToggleDarkMode }: SettingsManagerProps) {
  // State variables for customization
  const [appName, setAppName] = useState(localStorage.getItem('sams_custom_app_name_v2') || 'منصة الإدارة');
  const [appLogo, setAppLogo] = useState(localStorage.getItem('sams_custom_app_logo_v2') || 'م');
  const [headerTitle, setHeaderTitle] = useState(localStorage.getItem('sams_custom_header_title_v2') || 'المنصة التعليمية المتكاملة للمعلم');
  const [headerSubtitle, setHeaderSubtitle] = useState(localStorage.getItem('sams_custom_header_subtitle_v2') || 'بوابة التحكم الإدارية والحصص الأكاديمية');

  // Msg templates
  const [tAbsence, setTAbsence] = useState(localStorage.getItem('sams_msg_template_absence') || 'عزيزي ولي الأمر ({اسم_ولي_الأمر})، نحيطكم علماً بتغيب ابنكم ({اسم_الطالب}) عن السنتر اليوم. نرجو التواصل مع الإدارة لتوضيح السبب.');
  const [tExcellent, setTExcellent] = useState(localStorage.getItem('sams_msg_template_excellent') || 'بشرى سارة لولي الأمر ({اسم_ولي_الأمر})، أبدى الطالب/الطالبة ({اسم_الطالب}) اليوم تفوقاً دراسياً متميزاً ومشاركة رائعة في الحصة! ونال تشجيعاً خاصاً من الإدارة.');
  const [tFees, setTFees] = useState(localStorage.getItem('sams_msg_template_fees') || 'تحية طيبة لولي الأمر ({اسم_ولي_الأمر})، نود تذكيركم بلطف بوجوب سداد الرسوم الدراسية المتبقية لملف الطالب ({اسم_الطالب}) لانتظام القيد المالي. شكراً لتعاونكم.');
  const [tMeeting, setTMeeting] = useState(localStorage.getItem('sams_msg_template_meeting') || 'المحترم ({اسم_ولي_الأمر})، نتشرف بدعوتكم لحضور مجلس الآباء القادم بالسنتر لمتابعة المسار التعليمي لولدكم ({اسم_الطالب}).');

  // WhatsApp variables
  const [callmebotKey, setCallmebotKey] = useState(localStorage.getItem('sams_callmebot_api_key') || '');
  const [ultramsgId, setUltramsgId] = useState(localStorage.getItem('sams_ultramsg_instance_id') || '');
  const [ultramsgToken, setUltramsgToken] = useState(localStorage.getItem('sams_ultramsg_token') || '');
  const [whatsappEnabled, setWhatsappEnabled] = useState(localStorage.getItem('sams_whatsapp_enabled') !== 'false');

  // Audio & Visual Notification Alerts Settings
  const [notificationTone, setNotificationTone] = useState<string>(
    localStorage.getItem('sams_notification_tone') || 'chime'
  );
  const [toneAttendance, setToneAttendance] = useState<string>(
    localStorage.getItem('sams_tone_attendance') || 'chime'
  );
  const [toneFees, setToneFees] = useState<string>(
    localStorage.getItem('sams_tone_fees') || 'bell'
  );
  const [toneAdmin, setToneAdmin] = useState<string>(
    localStorage.getItem('sams_tone_admin') || 'digital'
  );

  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    localStorage.getItem('sams_notification_sound_enabled') !== 'false'
  );
  const [visualAlertsEnabled, setVisualAlertsEnabled] = useState<boolean>(
    localStorage.getItem('sams_visual_alerts_enabled') !== 'false'
  );

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setNotification({
          type: 'error',
          message: 'حجم الملف كبير للغاية! يرجى رفع صورة أقل من 2 ميجابايت لضمان الأداء السريع وسعة حفظ المتصفح.'
        });
        setTimeout(() => setNotification(null), 4000);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAppLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('sams_custom_app_name_v2', appName.trim());
      localStorage.setItem('sams_custom_app_logo_v2', appLogo.trim());
      localStorage.setItem('sams_custom_header_title_v2', headerTitle.trim());
      localStorage.setItem('sams_custom_header_subtitle_v2', headerSubtitle.trim());

      localStorage.setItem('sams_msg_template_absence', tAbsence.trim());
      localStorage.setItem('sams_msg_template_excellent', tExcellent.trim());
      localStorage.setItem('sams_msg_template_fees', tFees.trim());
      localStorage.setItem('sams_msg_template_meeting', tMeeting.trim());

      localStorage.setItem('sams_callmebot_api_key', callmebotKey.trim());
      localStorage.setItem('sams_ultramsg_instance_id', ultramsgId.trim());
      localStorage.setItem('sams_ultramsg_token', ultramsgToken.trim());
      localStorage.setItem('sams_whatsapp_enabled', whatsappEnabled ? 'true' : 'false');

      localStorage.setItem('sams_notification_tone', notificationTone);
      localStorage.setItem('sams_tone_attendance', toneAttendance);
      localStorage.setItem('sams_tone_fees', toneFees);
      localStorage.setItem('sams_tone_admin', toneAdmin);
      localStorage.setItem('sams_notification_sound_enabled', soundEnabled ? 'true' : 'false');
      localStorage.setItem('sams_visual_alerts_enabled', visualAlertsEnabled ? 'true' : 'false');

      setNotification({
        type: 'success',
        message: 'تم حفظ كافة الإعدادات والهوية البصرية وقوالب الرسائل بنجاح!'
      });

      // Notify parent app
      onSettingsSaved();

      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'حدث خطأ أثناء محاولة حفظ الإعدادات بالمتصفح.'
      });
    }
  };

  const confirmResetDefaults = () => {
    setAppName('منصة الإدارة');
    setAppLogo('S');
    setHeaderTitle('المنصة التعليمية المتكاملة');
    setHeaderSubtitle('بوابة التحكم الإدارية والحصص الأكاديمية');
    setTAbsence('عزيزي ولي الأمر ({اسم_ولي_الأمر})، نحيطكم علماً بتغيب ابنكم ({اسم_الطالب}) عن السنتر اليوم. نرجو التواصل مع الإدارة لتوضيح السبب.');
    setTExcellent('بشرى سارة لولي الأمر ({اسم_ولي_الأمر})، أبدى الطالب/الطالبة ({اسم_الطالب}) اليوم تفوقاً دراسياً متميزاً ومشاركة رائعة في الحصة! ونال تشجيعاً خاصاً من الإدارة.');
    setTFees('تحية طيبة لولي الأمر ({اسم_ولي_الأمر})، نود تذكيركم بلطف بوجوب سداد الرسوم الدراسية المتبقية لملف الطالب ({اسم_الطالب}) لانتظام القيد المالي. شكراً لتعاونكم.');
    setTMeeting('المحترم ({اسم_ولي_الأمر})، نتشرف بدعوتكم لحضور مجلس الآباء القادم بالسنتر لمتابعة المسار التعليمي لولدكم ({اسم_الطالب}).');
    setWhatsappEnabled(true);
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6" dir="rtl" id="sams_settings_manager_module">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-3xs">
        <div className="space-y-1 text-right">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            
            إعدادات النظام وتخصيص الهوية
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            تخصيص اسم التطبيق، اللوجو، قوالب الرسائل التلقائية لأولياء الأمور، ومفاتيح واتساب الخلفية.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2.5 animate-fade-in shadow-3xs text-right ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-bold">{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* ROW 0: Dark Mode & Theme Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-slate-50/50 flex items-center justify-between text-right">
            <div className="flex items-center gap-2">
              <Palette className="w-4.5 h-4.5 text-[#0D5C8C]" />
              <h3 className="font-bold text-xs text-slate-800">تفضيلات مظهر الواجهة والوضع الداكن (Dark Mode)</h3>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-150">
              تباين عالي ومريح للعين
            </span>
          </div>
          <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-right">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                {isDarkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-indigo-600" />}
                {isDarkMode ? 'الوضع الداكن مفعّل حالياً' : 'الوضع الفاتح مفعّل حالياً'}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                تعديل ألوان الواجهة بالكامل لتناسب الرؤية الليلية أو البيئات ذات الإضاءة المنخفضة مع تحسين تباين النصوص والأيقونات في جميع القوائم والجداول.
              </p>
            </div>

            {onToggleDarkMode && (
              <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleDarkMode} />
            )}
          </div>
        </div>

        {/* ROW 0.5: Audio Notification Tones & Alert Controls */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-slate-50/50 flex items-center justify-between text-right">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4.5 h-4.5 text-[#0D5C8C]" />
              <h3 className="font-bold text-xs text-slate-800">إعدادات النغمات والتنبيهات الصوتية والمباشرة (Notification Sound Tones)</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Web Audio Synthesizer
            </span>
          </div>

          <div className="p-5 space-y-5 text-right">
            
            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    التنبيه الصوتي التلقائي
                  </h4>
                  <p className="text-[10px] text-slate-500">تشغيل نغمة عند إضافة أو وصول إشعار جديد بالسيستم</p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => {
                    setSoundEnabled(e.target.checked);
                    if (e.target.checked) playNotificationTone(notificationTone as NotificationTone);
                  }}
                  className="w-4 h-4 accent-[#0D5C8C] cursor-pointer shrink-0"
                />
              </div>

              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-amber-500" />
                    التنبيه المرئي البارز (Pop-up Alert)
                  </h4>
                  <p className="text-[10px] text-slate-500">عرض بنر منبثق أعلى الشاشة عند رصد إشعارات جديدة</p>
                </div>
                <input
                  type="checkbox"
                  checked={visualAlertsEnabled}
                  onChange={(e) => setVisualAlertsEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#0D5C8C] cursor-pointer shrink-0"
                />
              </div>
            </div>

            {/* Category-Specific Sound Dropdowns with Trial Listen Button */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-100">
                  تخصيص نغمة التنبيه لكل نوع من الإشعارات (انقر زر الاستماع لتجربة الصوت):
                </label>
                <span className="text-[10px] text-slate-500 font-sans">اختر النغمة ثم اضغط تجربة 🔊</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 1. Attendance & Absence Tones */}
                <div className="p-4 bg-slate-50/90 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      إشعارات الحضور والغياب
                    </span>
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-md">
                      Attendance
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={toneAttendance}
                      onChange={(e) => {
                        setToneAttendance(e.target.value);
                        playNotificationTone(e.target.value as NotificationTone);
                      }}
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-[#0D5C8C]"
                    >
                      {TONE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => playNotificationTone(toneAttendance as NotificationTone)}
                      className="px-3 py-1.5 rounded-lg bg-[#0D5C8C] hover:bg-[#0a4a70] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
                      title="تجربة سماع النغمة الحالية"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>تجربة</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {TONE_OPTIONS.find(t => t.id === toneAttendance)?.desc}
                  </p>
                </div>

                {/* 2. Fees & Financial Tones */}
                <div className="p-4 bg-slate-50/90 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      تنبيهات الرسوم والماليات
                    </span>
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md">
                      Fees
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={toneFees}
                      onChange={(e) => {
                        setToneFees(e.target.value);
                        playNotificationTone(e.target.value as NotificationTone);
                      }}
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-[#0D5C8C]"
                    >
                      {TONE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => playNotificationTone(toneFees as NotificationTone)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
                      title="تجربة سماع النغمة الحالية"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>تجربة</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {TONE_OPTIONS.find(t => t.id === toneFees)?.desc}
                  </p>
                </div>

                {/* 3. Admin Notifications Tones */}
                <div className="p-4 bg-slate-50/90 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                      إشعارات الإدارة والسيستم
                    </span>
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-md">
                      Admin
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={toneAdmin}
                      onChange={(e) => {
                        setToneAdmin(e.target.value);
                        playNotificationTone(e.target.value as NotificationTone);
                      }}
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden focus:border-[#0D5C8C]"
                    >
                      {TONE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => playNotificationTone(toneAdmin as NotificationTone)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
                      title="تجربة سماع النغمة الحالية"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>تجربة</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {TONE_OPTIONS.find(t => t.id === toneAdmin)?.desc}
                  </p>
                </div>

              </div>
            </div>



          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-slate-50/50 flex items-center gap-2 text-right">
            <Image className="w-4.5 h-4.5 text-[#0D5C8C]" />
            <h3 className="font-bold text-xs text-slate-800">1. الهوية البصرية وشعارات النظام والتطبيق</h3>
          </div>
          <div className="p-5 space-y-4 text-right">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">اسم التطبيق الفرعي (بالشريط الجانبي):</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="منصة الإدارة"
                  className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-lg text-right outline-none focus:border-[#0D5C8C] shadow-3xs"
                  required
                />
                <span className="text-[10px] text-slate-400 block">(الاسم المعروض أعلى الشريط اليمين والجانبي)</span>
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700">هوية وألوان المنصة المعتمدة:</label>
                <div className="bg-emerald-50/70 border border-emerald-150 p-4 rounded-xl flex items-center gap-3 text-right">
                  <div className="w-10 h-10 rounded-lg bg-[#0D5C8C] flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm font-sans select-none">
                    ض
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-none">شعار المنظومة مفعّل بنجاح</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      تم اعتماد الهوية الراقية: <strong className="text-[#0D5C8C]">الدكتور في اللغة العربية</strong> كعنوان وشعار أساسي بكل الواجهات.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">عنوان المنصة الرئيسي (بالأعلى):</label>
                <input
                  type="text"
                  value={headerTitle}
                  onChange={(e) => setHeaderTitle(e.target.value)}
                  placeholder="المنصة التعليمية المتكاملة للمعلم"
                  className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-lg text-right outline-none focus:border-[#0D5C8C] shadow-3xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">وصف وعنوان المنصة الفرعي:</label>
                <input
                  type="text"
                  value={headerSubtitle}
                  onChange={(e) => setHeaderSubtitle(e.target.value)}
                  placeholder="بوابة التحكم الإدارية والحصص الأكاديمية"
                  className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-lg text-right outline-none focus:border-[#0D5C8C] shadow-3xs"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Custom Notification Templates */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-slate-50/50 flex items-center justify-between text-right">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-[#0D5C8C]" />
              <h3 className="font-bold text-xs text-slate-800">2. تخصيص قوالب وصيغ الرسائل التلقائية (الغياب وغيرها)</h3>
            </div>
            <div className="bg-blue-50 text-[#0D5C8C] px-2 py-1 text-[10px] font-bold rounded">
              صيغة ذكية تستخدم المتغيرات التلقائية
            </div>
          </div>
          <div className="p-5 space-y-4 text-right">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-800 leading-relaxed font-medium">
               <b>ملاحظة المتغيرات:</b> يمكنك استخدام الرموز التالية داخل أي قالب، ليقوم النظام بتعويضها تلقائياً بالاسم الفعلي للطالب وولي الأمر عند الإرسال:
              <div className="grid grid-cols-3 gap-2 mt-2 text-center text-[10px]">
                <div className="bg-white p-1 rounded border border-amber-200"><code className="font-bold text-rose-600 font-mono">{"{اسم_الطالب}"}</code> لاسم الطالب</div>
                <div className="bg-white p-1 rounded border border-amber-200"><code className="font-bold text-rose-600 font-mono">{"{اسم_ولي_الأمر}"}</code> لولي أمر الطالب</div>
                <div className="bg-white p-1 rounded border border-amber-200"><code className="font-bold text-[#0D5C8C] font-mono">{"{التاريخ}"}</code> لتاريخ اليوم تلقائياً</div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Absence Template */}
              <div className="space-y-1.5 p-3 rounded-lg bg-red-55/10 border border-red-100">
                <span className="text-rose-700 text-[10px] font-bold px-1.5 py-0.5 bg-rose-50 rounded">إشعار غياب الحضور اليومي:</span>
                <textarea
                  rows={3}
                  value={tAbsence}
                  onChange={(e) => setTAbsence(e.target.value)}
                  className="w-full mt-1.5 p-2 text-xs bg-white border border-gray-250 rounded-lg text-right outline-none focus:border-red-500 shadow-3xs font-medium leading-relaxed"
                  placeholder="نص رسالة الغياب..."
                  required
                />
                <div className="text-[10px] text-slate-400 mt-1">يُرسل فور تسجيل غياب الطالب وإشعاره هاتفياً.</div>
              </div>

              {/* Outstanding template */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5 p-3 rounded-lg bg-emerald-55/10 border border-emerald-100">
                  <span className="text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 rounded">رسالة تهنئة / التميز الطلابي:</span>
                  <textarea
                    rows={3}
                    value={tExcellent}
                    onChange={(e) => setTExcellent(e.target.value)}
                    className="w-full mt-1.5 p-2 text-xs bg-white border border-gray-250 rounded-lg text-right outline-none focus:border-emerald-500 shadow-3xs font-medium leading-relaxed"
                    placeholder="نص رسالة التميز..."
                    required
                  />
                </div>

                <div className="space-y-1.5 p-3 rounded-lg bg-sky-55/10 border border-sky-100">
                  <span className="text-sky-800 text-[10px] font-bold px-1.5 py-0.5 bg-sky-50 rounded">رسالة تذكير باشتراكات الشهر والرسوم المالية:</span>
                  <textarea
                    rows={3}
                    value={tFees}
                    onChange={(e) => setTFees(e.target.value)}
                    className="w-full mt-1.5 p-2 text-xs bg-white border border-gray-250 rounded-lg text-right outline-none focus:border-sky-500 shadow-3xs font-medium leading-relaxed"
                    placeholder="نص رسالة الاشتراكات والرسوم..."
                    required
                  />
                </div>

                <div className="space-y-1.5 p-3 rounded-lg bg-indigo-55/10 border border-indigo-100">
                  <span className="text-indigo-800 text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 rounded">رسالة دعوة لحضور اجتماع الآباء:</span>
                  <textarea
                    rows={3}
                    value={tMeeting}
                    onChange={(e) => setTMeeting(e.target.value)}
                    className="w-full mt-1.5 p-2 text-xs bg-white border border-gray-250 rounded-lg text-right outline-none focus:border-indigo-500 shadow-3xs font-medium leading-relaxed"
                    placeholder="نص رسالة اجتماع أولياء الأمور..."
                    required
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ROW 3: Centralized WhatsApp Integrations */}
        <div className={`bg-white rounded-2xl border ${whatsappEnabled ? 'border-gray-100' : 'border-gray-200'} shadow-2xs overflow-hidden transition-colors`}>
          <div className="p-5 border-b border-gray-50 bg-slate-50/50 flex items-center justify-between text-right">
            <div className="flex items-center gap-2">
              <Key className="w-4.5 h-4.5 text-[#0D5C8C]" />
              <h3 className="font-bold text-xs text-slate-800">3. بوابات الإرسال السحابي للواتسآب (إرسال صامت بالخلفية)</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold ${whatsappEnabled ? 'text-emerald-600' : 'text-slate-500'}`}>{whatsappEnabled ? 'مفعل' : 'معطل'}</span>
              <button 
                type="button"
                onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer focus:outline-hidden ${whatsappEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${whatsappEnabled ? 'left-1' : 'left-6'}`} />
              </button>
            </div>
          </div>
          <div className={`p-5 space-y-4 text-right transition-opacity ${!whatsappEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <p className="text-xs text-slate-500 leading-relaxed">
              إذا كنت قد قمت بتفعيل باقتك، يمكنك وضع المفتاح الخاص بك بالأسفل. سيقوم السيستم فوراً بالإرسال المباشر للواتسآب في الخلفية صامتًا بالخفاء بمجرد رصد الغياب أو الحضور أو طباعة الإيصال ودون فتح تطبيق واتساب يدويًا على جهازك!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CallMeBot Group */}
              <div className="p-4 bg-emerald-50/20 rounded-xl border border-emerald-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 bg-emerald-105/10 text-emerald-800 text-[10px] font-black rounded">خيار 1: CallMeBot (تفعيل شخصي ومجاني)</span>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">كود الـ API Key لـ CallMeBot الخاص بك:</label>
                  <input
                    type="text"
                    value={callmebotKey}
                    onChange={(e) => setCallmebotKey(e.target.value)}
                    placeholder="أدخل كود الـ API مثل 321852..."
                    className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-lg text-left font-mono outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    يمكن الحصول عليه بمراسلة البوت <b className="font-mono text-slate-700">+34 621 07 33 53</b> على الواتساب بعبارة: <code className="bg-emerald-50 text-emerald-600 font-bold px-1 rounded">I allow callmebot to send me messages</code>
                  </span>
                </div>
              </div>

              {/* UltraMsg Group */}
              <div className="p-4 bg-sky-50/20 rounded-xl border border-sky-100 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 bg-sky-105/10 text-sky-800 text-[10px] font-black rounded">خيار 2: UltraMsg (بوابة المدارس الاحترافية بالخلفية)</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-700">رقم السيرفر (Instance ID):</label>
                    <input
                      type="text"
                      value={ultramsgId}
                      onChange={(e) => setUltramsgId(e.target.value)}
                      placeholder="instance12345"
                      className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-lg text-left font-mono outline-none focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-700">كود التحقق (Token):</label>
                    <input
                      type="text"
                      value={ultramsgToken}
                      onChange={(e) => setUltramsgToken(e.target.value)}
                      placeholder="token_value"
                      className="w-full p-2.5 text-xs bg-white border border-gray-200 rounded-lg text-left font-mono outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 block pt-1">
                  اربط واتساب خط السنتر بـ <a href="https://ultramsg.com" target="_blank" rel="noreferrer" className="text-sky-600 font-bold hover:underline">ultramsg.com</a> لإرسال جماعي احترافي وفوري لأي رقم.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between p-4 bg-slate-55/10 border border-gray-150 rounded-2xl">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-gray-200 text-slate-600 rounded-xl text-xs font-bold transition-transform active:scale-95 cursor-pointer"
          >
            استعادة افتراضيات المصنع
          </button>

          <button
            type="submit"
            className="px-8 py-3 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-md transform active:scale-95"
          >
            <Save className="w-4 h-4" />
            حفظ إعدادات الهوية واللوجو والرسائل 
          </button>
        </div>
      </form>

      {/* Reset Defaults Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full p-6 text-right space-y-4"
            >
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 text-sm">استعادة القيم الافتراضية للنظام</h3>
                  <p className="text-[11px] text-slate-500 font-sans font-medium">سيتم مسح قوالب الرسائل المخصصة</p>
                </div>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed font-sans space-y-1.5 py-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p>هل أنت متأكد من رغبتك في استعادة القيم الافتراضية للنظام؟</p>
                <p className="text-[10px] text-slate-400">تحذير: سيتم إرجاع اسم التطبيق وقوالب الرسائل إلى صيغتها الأولية.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 border border-gray-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={confirmResetDefaults}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                >
                  تأكيد الاستعادة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
