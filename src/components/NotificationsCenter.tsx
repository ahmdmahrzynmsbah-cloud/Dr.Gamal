/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SystemNotification, Student, AdminNotification } from '../types';
import { samsDb } from '../utils/db';
import { useSamsDbSync } from '../hooks/useSamsDbSync';
import { appendSystemSignature } from '../utils/phoneUtils';

import {
  Check, 
  ShieldAlert, 
  AlertTriangle, 
  Send, 
  Mail, 
  MessageSquare, 
  Megaphone, 
  Calendar, 
  Search, 
  Phone, 
  Bell, 
  CheckCircle2, 
  CheckCheck,
  Smartphone,
  Loader2,
  Trash2,
  Filter,
  CreditCard,
  UserX,
  FileCheck2,
  ExternalLink,
  RefreshCw,
  Clock,
  Sparkles,
  Inbox,
  XCircle,
  Eye,
  EyeOff,
  ChevronRight,
  Info
} from 'lucide-react';

interface NotificationsCenterProps {
  onNavigateToTab?: (tab: string) => void;
  initialSubTab?: 'inbox' | 'parents' | 'broadcast' | 'logs';
}

export default function NotificationsCenter({ onNavigateToTab, initialSubTab = 'inbox' }: NotificationsCenterProps) {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [adminNotis, setAdminNotis] = useState<AdminNotification[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'parents' | 'broadcast' | 'logs'>(initialSubTab);
  
  // Filters for the Inbox sub-tab
  const [inboxSearch, setInboxSearch] = useState('');
  const [filterReadStatus, setFilterReadStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'absence' | 'payment_reminder' | 'exam' | 'sms' | 'system'>('all');
  const [filterTimeRange, setFilterTimeRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Search state for parents subtab
  const [parentSearchTerm, setParentSearchTerm] = useState('');
  
  // Quick direct message modal of SMS
  const [selectedParentStudent, setSelectedParentStudent] = useState<Student | null>(null);
  const [directSmsText, setDirectSmsText] = useState('');
  
  // Success / Error alerts
  const [successInfo, setSuccessInfo] = useState('');
  const [errorInfo, setErrorInfo] = useState('');

  // Delete Confirmation Modal State
  const [deleteConfirmState, setDeleteConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'single' | 'read' | 'all';
    targetId?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'single'
  });

  // Auto-clear messages after 3.5 seconds
  useEffect(() => {
    if (successInfo) {
      const timer = setTimeout(() => setSuccessInfo(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [successInfo]);

  useEffect(() => {
    if (errorInfo) {
      const timer = setTimeout(() => setErrorInfo(''), 3500);
      return () => clearTimeout(timer);
    }
  }, [errorInfo]);

  // WhatsApp manual API Settings states
  const [showWpSettings, setShowWpSettings] = useState(false);
  const whatsappEnabled = localStorage.getItem('sams_whatsapp_enabled') !== 'false';
  const [callmebotKeyValue, setCallmebotKeyValue] = useState(localStorage.getItem('sams_callmebot_api_key') || '');
  const [ultramsgIdValue, setUltramsgIdValue] = useState(localStorage.getItem('sams_ultramsg_instance_id') || '');
  const [ultramsgTokenValue, setUltramsgTokenValue] = useState(localStorage.getItem('sams_ultramsg_token') || '');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  const saveWpSettings = () => {
    localStorage.setItem('sams_callmebot_api_key', callmebotKeyValue.trim());
    localStorage.setItem('sams_ultramsg_instance_id', ultramsgIdValue.trim());
    localStorage.setItem('sams_ultramsg_token', ultramsgTokenValue.trim());
    setSettingsSavedMsg(true);
    setTimeout(() => setSettingsSavedMsg(false), 3000);
  };

  // Bulk Broadcast Form states
  const [broadcastFormData, setBroadcastFormData] = useState({
    title: '',
    message: '',
    category: 'sms' as SystemNotification['category'],
    recipient_type: 'parents' as SystemNotification['recipient_type'],
    recipient_id: ''
  });

  // Live Gateway Transmission Overlay Monitor state
  const [transmissionState, setTransmissionState] = useState<{
    isOpen: boolean;
    studentName: string;
    parentName: string;
    phone: string;
    message: string;
    progress: number;
    currentStep: string;
    status: 'connecting' | 'success' | 'failed';
    isSandbox: boolean;
    logs: string[];
  }>({
    isOpen: false,
    studentName: '',
    parentName: '',
    phone: '',
    message: '',
    progress: 0,
    currentStep: '',
    status: 'connecting',
    isSandbox: true,
    logs: []
  });

  const loadData = () => {
    setNotifications(samsDb.getNotifications());
    setAdminNotis(samsDb.getAdminNotifications());
    setStudents(samsDb.getVisibleStudents());
  };

  useEffect(() => {
    loadData();
    const handleNotiChanged = () => loadData();
    window.addEventListener('sams_admin_notifications_changed', handleNotiChanged);
    return () => window.removeEventListener('sams_admin_notifications_changed', handleNotiChanged);
  }, []);

  useSamsDbSync(() => {
    loadData();
  });

  // Unread counts & metrics
  const unreadAdminCount = useMemo(() => adminNotis.filter(n => !n.read).length, [adminNotis]);
  const totalNotisCount = adminNotis.length;
  
  const todayNotisCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return adminNotis.filter(n => {
      const nDate = new Date(n.created_at).toISOString().split('T')[0];
      return nDate === todayStr;
    }).length;
  }, [adminNotis]);

  const absenceNotisCount = useMemo(() => adminNotis.filter(n => n.type === 'absence').length, [adminNotis]);
  const feesNotisCount = useMemo(() => adminNotis.filter(n => n.type === 'payment_reminder').length, [adminNotis]);

  // Filtered Inbox items
  const filteredInboxNotis = useMemo(() => {
    return adminNotis.filter(item => {
      // 1. Read status
      if (filterReadStatus === 'unread' && item.read) return false;
      if (filterReadStatus === 'read' && !item.read) return false;

      // 2. Category
      if (filterCategory !== 'all') {
        if (filterCategory === 'absence' && item.type !== 'absence') return false;
        if (filterCategory === 'payment_reminder' && item.type !== 'payment_reminder') return false;
        if (filterCategory === 'exam' && item.type !== 'exam') return false;
        if (filterCategory === 'sms' && item.type !== 'sms') return false;
        if (filterCategory === 'system' && item.type !== 'system' && item.type !== 'alert') return false;
      }

      // 3. Time range
      if (filterTimeRange !== 'all') {
        const itemDate = new Date(item.created_at);
        const now = new Date();
        const diffMs = now.getTime() - itemDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (filterTimeRange === 'today') {
          const itemDay = itemDate.toISOString().split('T')[0];
          const todayDay = now.toISOString().split('T')[0];
          if (itemDay !== todayDay) return false;
        } else if (filterTimeRange === 'week' && diffDays > 7) {
          return false;
        } else if (filterTimeRange === 'month' && diffDays > 30) {
          return false;
        }
      }

      // 4. Search text
      if (inboxSearch.trim()) {
        const query = inboxSearch.trim().toLowerCase();
        const msg = (item.message || '').toLowerCase();
        const stdName = (item.metadata?.studentName || '').toLowerCase();
        if (!msg.includes(query) && !stdName.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [adminNotis, filterReadStatus, filterCategory, filterTimeRange, inboxSearch]);

  // Handlers for Inbox actions with custom Confirmation Dialog
  const handleToggleRead = (id: string) => {
    samsDb.toggleAdminNotificationRead(id);
    loadData();
  };

  const handleMarkAllInboxRead = () => {
    samsDb.markAllAdminNotificationsRead();
    loadData();
    setSuccessInfo('تم تحديد جميع الإشعارات كمقروءة بنجاح.');
  };

  const requestDeleteSingleNoti = (id: string) => {
    setDeleteConfirmState({
      isOpen: true,
      title: 'تأكيد حذف الإشعار',
      description: 'هل أنت متأكد من رغبتك في حذف هذا الإشعار بشكل نهائي من الصندوق؟',
      actionType: 'single',
      targetId: id
    });
  };

  const requestClearReadNotis = () => {
    const readCount = adminNotis.filter(n => n.read).length;
    if (readCount === 0) {
      setErrorInfo('لا توجد إشعارات مقروءة لحذفها حالياً.');
      return;
    }
    setDeleteConfirmState({
      isOpen: true,
      title: 'تأكيد حذف المقروء',
      description: `هل أنت متأكد من حذف كافة الإشعارات المقروءة (${readCount} إشعار) نهائياً من السجل؟`,
      actionType: 'read'
    });
  };

  const requestClearAllNotis = () => {
    if (adminNotis.length === 0) {
      setErrorInfo('صندوق الإشعارات فارغ بالفعل.');
      return;
    }
    setDeleteConfirmState({
      isOpen: true,
      title: 'تأكيد المسح الشامل والنهائي',
      description: `تحذير: سيتم مسح كافة الإشعارات والتنبيهات (${adminNotis.length} إشعار) بالكامل ولن تتمكن من استرجاعها. هل تريد المتابعة؟`,
      actionType: 'all'
    });
  };

  const executeConfirmedDeletion = () => {
    const { actionType, targetId } = deleteConfirmState;
    if (actionType === 'single' && targetId) {
      samsDb.deleteAdminNotification(targetId);
      loadData();
      setSuccessInfo('تم حذف الإشعار بنجاح.');
    } else if (actionType === 'read') {
      samsDb.clearReadAdminNotifications();
      loadData();
      setSuccessInfo('تم حذف جميع الإشعارات المقروءة بنجاح.');
    } else if (actionType === 'all') {
      samsDb.clearAllAdminNotifications();
      loadData();
      setSuccessInfo('تم مسح جميع الإشعارات والتنبيهات بالكامل.');
    }
    setDeleteConfirmState(prev => ({ ...prev, isOpen: false, targetId: undefined }));
  };

  const triggerLiveSmsTransmission = async (studentName: string, parentName: string, phone: string, message: string) => {
    const cKey = localStorage.getItem('sams_callmebot_api_key') || '';
    const uId = localStorage.getItem('sams_ultramsg_instance_id') || '';
    const uToken = localStorage.getItem('sams_ultramsg_token') || '';

    setTransmissionState({
      isOpen: true,
      studentName,
      parentName,
      phone,
      message,
      progress: 30,
      currentStep: 'جاري الإرسال...',
      status: 'connecting',
      isSandbox: true,
      logs: []
    });

    try {
      const smsPromise = fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, message })
      });

      let waPromise = null;
      if (whatsappEnabled) {
        const isAlsafa = typeof window !== 'undefined' && localStorage.getItem('sams_active_system') === 'alsafa';
        const platformName = isAlsafa ? 'إدارة سيستم الصفا للمواد الشرعية' : 'إدارة الدكتور في اللغة العربية';
        waPromise = fetch('/api/send-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            to: phone, 
            message: ` 🏛️ رسالة رسمية لولي الأمر من ${platformName} \n\n${message}`,
            callmebotApiKey: cKey,
            ultramsgInstanceId: uId,
            ultramsgToken: uToken
          })
        });
      }

      const [smsRes, waRes] = await Promise.all([smsPromise, waPromise]);
      let smsData: any = {};
      let waData: any = {};
      
      try { smsData = await smsRes.json(); } catch(e) {}
      try { if (waRes) waData = await waRes.json(); } catch(e) {}

      const isSmsOk = smsRes.ok && smsData.success;
      const isWaOk = whatsappEnabled ? (waRes && waRes.ok && waData.success) : true;

      if (isSmsOk || isWaOk) {
        setTransmissionState(prev => ({
          ...prev,
          progress: 100,
          currentStep: 'تم الإرسال بنجاح',
          status: 'success',
          isSandbox: !!((smsData && smsData.simulated) || (waData && waData.simulated)),
          logs: []
        }));
      } else {
        const errText = waData.error || smsData.error || 'تعذر تسليم البث المزدوج.';
        throw new Error(errText);
      }
    } catch (err: any) {
      setTransmissionState(prev => ({
        ...prev,
        progress: 100,
        currentStep: 'فشل الإرسال',
        status: 'failed',
        logs: []
      }));
    }
  };

  const handleSendDirectSms = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessInfo('');
    setErrorInfo('');

    if (!selectedParentStudent) return;
    if (!directSmsText.trim()) {
      setErrorInfo('يرجى كتابة نص الرسالة التي تريد إرسالها إلى ولي الأمر أولاً.');
      return;
    }

    const parentName = selectedParentStudent.parent_name || 'ولي أمر الطالب';
    const parentPhone = selectedParentStudent.parent_phone || selectedParentStudent.phone || 'غير مسجل';
    const formattedMessage = appendSystemSignature(directSmsText);

    samsDb.addNotification({
      title: `رسالة SMS فورية مخصصة: ${selectedParentStudent.name}`,
      message: formattedMessage,
      category: 'sms',
      recipient_type: 'specific',
      recipient_id: selectedParentStudent.id
    });

    samsDb.addAdminNotification({
      type: 'sms',
      message: `تم توجيه رسالة مخصصة لولي أمر الطالب (${selectedParentStudent.name}): "${formattedMessage.substring(0, 60)}..."`,
      metadata: {
        studentId: selectedParentStudent.id,
        studentName: selectedParentStudent.name
      }
    });

    setSuccessInfo(`تم توجيه الرسالة وإرسالها في ثوانٍ لهاتف ولي الأمر (${parentName}) على الرقم (${parentPhone})!`);
    triggerLiveSmsTransmission(selectedParentStudent.name, parentName, parentPhone, formattedMessage);
    
    setSelectedParentStudent(null);
    setDirectSmsText('');
    loadData();
    setTimeout(() => setSuccessInfo(''), 6000);
  };

  const selectSmsTemplate = (templateType: 'absence' | 'homework' | 'exam' | 'behavior') => {
    if (!selectedParentStudent) return;
    
    const childName = selectedParentStudent.name;
    const parentName = selectedParentStudent.parent_name || 'ولي الأمر العزيز';

    const tAbsence = localStorage.getItem('sams_msg_template_absence') || 'عزيزي ولي الأمر ({اسم_ولي_الأمر})، بنبلغك إن الطالب/ة ({اسم_الطالب}) غاب النهاردة عن السنتر. ياريت تتواصل معانا عشان نعرف السبب. شكراً لمتابعتك.';
    const tHomework = localStorage.getItem('sams_msg_template_homework') || 'عزيزي ولي الأمر ({اسم_ولي_الأمر})، بنبلغك إن الطالب/ة ({اسم_الطالب}) مسلمش الواجب بتاعه النهارده. ياريت نتابع معاه عشان ميأثرش على مستواه.';
    const tExam = localStorage.getItem('sams_msg_template_exam') || 'عزيزي ولي الأمر ({اسم_ولي_الأمر})، بنبلغك إن نتيجة الطالب/ة ({اسم_الطالب}) في الامتحان طلعت، ياريت تتابع معانا عشان تعرف مستواه وتطمن عليه.';
    const tBehavior = localStorage.getItem('sams_msg_template_behavior') || 'عزيزي ولي الأمر ({اسم_ولي_الأمر})، نرجو التنبيه على الطالب/ة ({اسم_الطالب}) بخصوص الالتزام بقواعد السنتر وعدم إثارة الشغب أثناء الحصة.';

    const getParsedText = (template: string) => {
      const todayString = new Date().toISOString().split('T')[0];
      const parsed = template
        .replace(/{اسم_ولي_الأمر}/g, parentName)
        .replace(/{parent_name}/g, parentName)
        .replace(/{اسم_الطالب}/g, childName)
        .replace(/{student_name}/g, childName)
        .replace(/{التاريخ}/g, todayString)
        .replace(/{date}/g, todayString);
      return appendSystemSignature(parsed);
    };

    const text = {
      absence: getParsedText(tAbsence),
      homework: getParsedText(tHomework),
      exam: getParsedText(tExam),
      behavior: getParsedText(tBehavior)
    }[templateType];

    setDirectSmsText(text);
  };

  const handleSendGeneralBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessInfo('');
    setErrorInfo('');

    if (!broadcastFormData.title || !broadcastFormData.message) {
      setErrorInfo('يرجى كتابة عنوان الرسالة ونص الإشعار بالكامل.');
      return;
    }

    const formattedBroadcast = appendSystemSignature(broadcastFormData.message);

    samsDb.addNotification({
      title: broadcastFormData.title,
      message: formattedBroadcast,
      category: broadcastFormData.category,
      recipient_type: broadcastFormData.recipient_type,
      recipient_id: broadcastFormData.recipient_id || undefined
    });

    samsDb.addAdminNotification({
      type: 'system',
      message: `تم بث تعميم عام: "${broadcastFormData.title}" - ${formattedBroadcast.substring(0, 60)}...`
    });

    setSuccessInfo('تم نشر وبث الإشعار المعتمد بنجاح وإرساله فورياً لجميع الفئات المستهدفة!');
    setBroadcastFormData({
      title: '',
      message: '',
      category: 'sms',
      recipient_type: 'parents',
      recipient_id: ''
    });
    setActiveSubTab('logs');
    loadData();
    setTimeout(() => setSuccessInfo(''), 5000);
  };

  const filteredParentsStudents = students.filter(std => {
    const term = parentSearchTerm.trim().toLowerCase();
    if (!term) return true;
    
    const parentName = (std.parent_name || '').toLowerCase();
    const studentName = std.name.toLowerCase();
    const regId = std.registration_id.toLowerCase();
    const phoneNum = (std.parent_phone || '').toLowerCase();

    return parentName.includes(term) || studentName.includes(term) || regId.includes(term) || phoneNum.includes(term);
  });

  return (
    <div className="space-y-6 animate-fade-in" id="sams_notifications_center_page">
      
      {/* Header Banner & Stats */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 sm:p-7 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0D5C8C] to-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                  مركز الإشعارات والتنبيهات المباشرة
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  متابعة تنبيهات الغياب، استحقاقات الرسوم، درجات الامتحانات، وبث الرسائل للأهالي
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 justify-end flex-wrap">
            <button
              type="button"
              onClick={loadData}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث</span>
            </button>

            {unreadAdminCount > 0 && activeSubTab === 'inbox' && (
              <button
                type="button"
                onClick={handleMarkAllInboxRead}
                className="flex-1 sm:flex-initial px-4 py-2 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-sky-200" />
                <span>تحديد الكل كمقروء</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-700/60 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-[#0D5C8C] dark:text-blue-300 flex items-center justify-center shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">إجمالي التنبيهات</span>
              <span className="text-sm sm:text-base sm:text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100">{totalNotisCount}</span>
            </div>
          </div>

          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 block">غير مقروءة</span>
              <span className="text-sm sm:text-base sm:text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">{unreadAdminCount}</span>
            </div>
          </div>

          <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block">تنبيهات الغياب</span>
              <span className="text-sm sm:text-base sm:text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400">{absenceNotisCount}</span>
            </div>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 p-3.5 sm:p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block">تذكيرات الرسوم</span>
              <span className="text-sm sm:text-base sm:text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">{feesNotisCount}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Primary Sub-Tabs Switcher */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 gap-1 sm:gap-2 overflow-x-auto pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => { setActiveSubTab('inbox'); setSuccessInfo(''); }}
          className={`px-3.5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap ${
            activeSubTab === 'inbox'
              ? 'border-[#0D5C8C] text-[#0D5C8C] dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/40 rounded-t-xl'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4 shrink-0" />
          <span>الإشعارات المباشرة</span>
          {unreadAdminCount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-bold animate-pulse">
              {unreadAdminCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => { setActiveSubTab('parents'); setSuccessInfo(''); }}
          className={`px-3.5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap ${
            activeSubTab === 'parents'
              ? 'border-[#0D5C8C] text-[#0D5C8C] dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/40 rounded-t-xl'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4 shrink-0" />
          <span>دليل أولياء الأمور</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveSubTab('broadcast'); setSuccessInfo(''); }}
          className={`px-3.5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap ${
            activeSubTab === 'broadcast'
              ? 'border-[#0D5C8C] text-[#0D5C8C] dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/40 rounded-t-xl'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4 shrink-0" />
          <span>بث إشعار / تعميم</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveSubTab('logs'); setSuccessInfo(''); }}
          className={`px-3.5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap ${
            activeSubTab === 'logs'
              ? 'border-[#0D5C8C] text-[#0D5C8C] dark:text-sky-400 bg-sky-50/50 dark:bg-sky-950/40 rounded-t-xl'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>سجل الرسائل ({notifications.length})</span>
        </button>
      </div>

      {/* Success alert */}
      {successInfo && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{successInfo}</span>
        </div>
      )}

      {/* Error alert */}
      {errorInfo && (
        <div className="p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 text-[#C0152A] rounded-2xl text-xs sm:text-sm flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-[#E8192C] shrink-0" />
          <span className="font-bold">{errorInfo}</span>
        </div>
      )}

      {/* TAB 1: INBOX & LIVE NOTIFICATIONS WITH ADVANCED FILTERING */}
      {activeSubTab === 'inbox' && (
        <div className="space-y-4">
          
          {/* Filter Bar Panel */}
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            
            {/* Search + Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="ابحث في نص الإشعار، اسم الطالب، أو التفاصيل..."
                  value={inboxSearch}
                  onChange={(e) => setInboxSearch(e.target.value)}
                  className="w-full text-xs sm:text-sm border border-slate-200 dark:border-slate-700 pr-10 pl-3 py-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/40 focus:outline-none focus:border-[#0D5C8C] text-right"
                />
                {inboxSearch && (
                  <button
                    onClick={() => setInboxSearch('')}
                    className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    مسح
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 justify-end">
                <button
                  type="button"
                  onClick={requestClearReadNotis}
                  className="flex-1 sm:flex-initial px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="حذف المقروء فقط"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>حذف المقروء</span>
                </button>

                {adminNotis.length > 0 && (
                  <button
                    type="button"
                    onClick={requestClearAllNotis}
                    className="flex-1 sm:flex-initial px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="مسح كافة الإشعارات"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>مسح الكل</span>
                  </button>
                )}
              </div>

            </div>

            {/* Filter Pills: Read Status, Category, Time */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
              
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 ml-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  التصنيف:
                </span>
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'absence', label: '🚨 تنبيهات الغياب' },
                  { id: 'payment_reminder', label: '💰 تذكيرات الرسوم' },
                  { id: 'sms', label: '💬 رسائل الآباء' },
                  { id: 'system', label: '⚙️ النظام' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setFilterCategory(cat.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filterCategory === cat.id
                        ? 'bg-[#0D5C8C] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Status & Time */}
              <div className="flex items-center gap-2 flex-wrap">
                
                {/* Read Status Switch */}
                <div className="bg-slate-100 dark:bg-slate-900/60 p-0.5 rounded-lg flex items-center text-xs font-bold">
                  <button
                    onClick={() => setFilterReadStatus('all')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      filterReadStatus === 'all' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setFilterReadStatus('unread')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      filterReadStatus === 'unread' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    غير مقروء
                  </button>
                  <button
                    onClick={() => setFilterReadStatus('read')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      filterReadStatus === 'read' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    مقروء
                  </button>
                </div>

                {/* Time Range Filter */}
                <select
                  value={filterTimeRange}
                  onChange={(e) => setFilterTimeRange(e.target.value as any)}
                  className="bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-lg border-0 focus:ring-1 focus:ring-[#0D5C8C] cursor-pointer"
                >
                  <option value="all">كل الأوقات</option>
                  <option value="today">اليوم فقط</option>
                  <option value="week">آخر 7 أيام</option>
                  <option value="month">هذا الشهر</option>
                </select>

              </div>

            </div>

          </div>

          {/* Notifications Cards List */}
          <div className="space-y-2.5">
            {filteredInboxNotis.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700 space-y-3 shadow-sm">
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto">
                  <Bell className="w-7 h-7" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200">
                  لا توجد إشعارات مطابقة للفلترة الحالية
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  جرب تغيير خيارات الفلترة أو مسح كلمات البحث لعرض باقي الإشعارات والتنبيهات.
                </p>
                {(inboxSearch || filterReadStatus !== 'all' || filterCategory !== 'all' || filterTimeRange !== 'all') && (
                  <button
                    onClick={() => {
                      setInboxSearch('');
                      setFilterReadStatus('all');
                      setFilterCategory('all');
                      setFilterTimeRange('all');
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
                  >
                    إعادة ضبط الفلاتر
                  </button>
                )}
              </div>
            ) : (
              filteredInboxNotis.map((noti) => {
                const isAbsence = noti.type === 'absence';
                const isFee = noti.type === 'payment_reminder';
                const isSms = noti.type === 'sms';

                const iconBg = isAbsence
                  ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300'
                  : isFee
                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300'
                  : isSms
                  ? 'bg-sky-100 dark:bg-sky-950/40 text-[#0D5C8C] dark:text-sky-300'
                  : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300';

                const notiDate = new Date(noti.created_at);
                const isToday = notiDate.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={noti.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      noti.read
                        ? 'bg-white dark:bg-slate-800/80 border-gray-150 dark:border-gray-700/60 opacity-80 hover:opacity-100'
                        : 'bg-white dark:bg-slate-800 border-sky-200 dark:border-sky-800 shadow-md shadow-sky-500/5 ring-1 ring-sky-500/10'
                    }`}
                  >
                    {/* Left details + icon */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
                        {isAbsence ? (
                          <UserX className="w-5 h-5" />
                        ) : isFee ? (
                          <CreditCard className="w-5 h-5" />
                        ) : isSms ? (
                          <MessageSquare className="w-5 h-5" />
                        ) : (
                          <Bell className="w-5 h-5" />
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0 text-right">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            isAbsence ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' :
                            isFee ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                            'bg-sky-50 text-[#0D5C8C] dark:bg-sky-900/30 dark:text-sky-300'
                          }`}>
                            {isAbsence ? 'تنبيه غياب طالب' : isFee ? 'تذكير استحقاق رسوم' : isSms ? 'رسالة تواصل' : 'إشعار إداري'}
                          </span>

                          {!noti.read && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                              جديد
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400 font-sans flex items-center gap-1 mr-auto">
                            <Clock className="w-3 h-3" />
                            {isToday ? 'اليوم' : notiDate.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                            {' - '}
                            {notiDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className={`text-xs sm:text-sm leading-relaxed ${noti.read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-slate-50 font-bold'}`}>
                          {noti.message}
                        </p>

                        {noti.metadata?.studentName && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            الطالب المعني: <strong className="text-slate-800 dark:text-slate-100">{noti.metadata.studentName}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons on the right */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                      
                      {/* Smart navigation button if available */}
                      {onNavigateToTab && isAbsence && (
                        <button
                          onClick={() => onNavigateToTab('attendance')}
                          className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>سجل الحضور</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}

                      {onNavigateToTab && isFee && (
                        <button
                          onClick={() => onNavigateToTab('fees')}
                          className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>سجل الرسوم</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}

                      {/* Toggle read status */}
                      <button
                        onClick={() => handleToggleRead(noti.id)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          noti.read
                            ? 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                            : 'border-sky-200 text-[#0D5C8C] hover:bg-sky-50 dark:hover:bg-slate-700'
                        }`}
                        title={noti.read ? 'تحديد كغير مقروء' : 'تحديد كمقروء'}
                      >
                        {noti.read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>

                      {/* Delete notification */}
                      <button
                        type="button"
                        onClick={() => requestDeleteSingleNoti(noti.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                        title="حذف هذا الإشعار"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* TAB 2: PARENTS & DIRECT SMS SENDER */}
      {activeSubTab === 'parents' && (
        <div className="space-y-6">
          
          {/* Quick Notice detailing the instant link */}
          <div className="p-4 sm:p-5 bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-800 rounded-3xl flex flex-col md:flex-row md:items-center gap-4 justify-between" id="instant_sms_explanation_banner">
            <div className="space-y-1">
              <h4 className="font-black text-[#0D5C8C] dark:text-sky-300 text-sm">نظام إرسال الرسائل التلقائي متصل بنشاط!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                عندما ترصد غياب طالب من صفحة <b>"الانتظام اليومي"</b>، يرسل النظام تلقائياً رسالة SMS فورية لهاتف والده/والدتها لإخطارهم فوراً. 
                أدناه، يتاح لك كمعلم البحث المباشر في سجلات الآباء لإرسال أي رسائل تذكير أو تهنئة مخصصة يدوياً.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-black text-[#0D5C8C] bg-white dark:bg-slate-800 border border-sky-200 px-3.5 py-2 rounded-xl shrink-0">
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>إرسال الغياب بضغطة واحدة مفعل</span>
            </div>
          </div>

          {/* Parents grid & Search input */}
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2">
                دليل أرقام الهواتف والتواصل مع أولياء الأمور
              </h3>
              
              {/* Search filter input */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                <input
                  type="text"
                  placeholder="ابحث باسم الأب، اسم الطالب، رقم القيد..."
                  value={parentSearchTerm}
                  onChange={(e) => setParentSearchTerm(e.target.value)}
                  className="w-full text-xs sm:text-sm font-sans border border-slate-200 dark:border-slate-700 pr-9 pl-3 py-2 rounded-xl focus:outline-none focus:border-[#0D5C8C] text-right"
                />
              </div>
            </div>

            {/* Parents List Table */}
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xs">
              <table className="min-w-full text-right relative border-collapse" dir="rtl">
                <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-black border-b-2 border-slate-200 dark:border-slate-700 shadow-xs">
                  <tr>
                    <th className="p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 whitespace-nowrap">اسم ولي الأمر</th>
                    <th className="p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 whitespace-nowrap">الطالب التابع</th>
                    <th className="p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 whitespace-nowrap">رقم الهاتف المسجل</th>
                    <th className="p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 whitespace-nowrap">حالة إرسال الـ SMS للغياب</th>
                    <th className="p-3.5 text-left bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 whitespace-nowrap">الإجراء المباشر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  {filteredParentsStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        لا يوجد أولياء أمور مسجلين مطابقين لاسم البحث في سجلات شؤون الطلاب الحالية.
                      </td>
                    </tr>
                  ) : (
                    filteredParentsStudents.map(std => (
                      <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">{std.parent_name || 'غير محدد في النظام'}</td>
                        <td className="p-3.5 font-sans">
                          <span className="font-semibold text-[#0D5C8C] dark:text-sky-400">{std.name}</span>
                          <span className="text-[10px] text-slate-400 block">رقم قيد: #{std.registration_id}</span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {std.parent_phone || std.phone || 'دون رقم'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800 px-2 py-0.5 rounded font-black">
                            تلقائي ومبث فوراً
                          </span>
                        </td>
                        <td className="p-3.5 text-left">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedParentStudent(std);
                              setDirectSmsText('');
                            }}
                            className="px-3.5 py-1.5 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white text-xs font-bold rounded-xl transition-transform active:scale-95 shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5 text-sky-200" />
                            <span>مراسلة هاتفية فورية</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Direct Message Modal */}
          {selectedParentStudent && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-2xl max-w-lg w-full overflow-hidden p-4 sm:p-6 space-y-4 text-right animate-slide-up">
                
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-[#0D5C8C] dark:text-sky-300 flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                      إرسال رسالة SMS وواتساب لولي الأمر
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedParentStudent(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs space-y-1">
                  <div><b>ولي الأمر:</b> {selectedParentStudent.parent_name || 'ولي أمر الطالب'}</div>
                  <div><b>الطالب التابع:</b> {selectedParentStudent.name} (#{selectedParentStudent.registration_id})</div>
                  <div><b>رقم الهاتف المستهدف:</b> <span className="font-mono text-slate-800 dark:text-slate-100 font-bold">{selectedParentStudent.parent_phone || selectedParentStudent.phone || 'غير مسجل'}</span></div>
                </div>

                {/* Quick Predefined Templates */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">نماذج رسائل سريعة جاهزة:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => selectSmsTemplate('absence')}
                      className="p-2 text-right bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl border border-rose-100 dark:border-rose-900/30 transition-colors"
                    >
                      🚨 إخطار غياب عن الحصة
                    </button>
                    <button
                      type="button"
                      onClick={() => selectSmsTemplate('homework')}
                      className="p-2 text-right bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-100 dark:border-amber-900/30 transition-colors"
                    >
                      📝 تقصير في تسليم الواجب
                    </button>
                    <button
                      type="button"
                      onClick={() => selectSmsTemplate('exam')}
                      className="p-2 text-right bg-sky-50 dark:bg-sky-950/30 hover:bg-sky-100 text-[#0D5C8C] dark:text-sky-300 text-xs font-bold rounded-xl border border-sky-100 dark:border-sky-900/30 transition-colors"
                    >
                      🏆 نتيجة امتحان وتقييم
                    </button>
                    <button
                      type="button"
                      onClick={() => selectSmsTemplate('behavior')}
                      className="p-2 text-right bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-xl border border-purple-100 dark:border-purple-900/30 transition-colors"
                    >
                      ⚠️ ملاحظة سلوك وانضباط
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendDirectSms} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">نص الرسالة المخصصة:</label>
                    <textarea
                      value={directSmsText}
                      onChange={(e) => setDirectSmsText(e.target.value)}
                      rows={4}
                      placeholder="اكتب نص الرسالة هنا أو اختر قالباً من الأعلى..."
                      className="w-full text-xs sm:text-sm border border-slate-200 dark:border-slate-700 p-3 rounded-xl focus:outline-none focus:border-[#0D5C8C] text-right font-sans min-h-[90px]"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setSelectedParentStudent(null)}
                      className="px-4 py-2 text-xs border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 text-slate-600 dark:text-slate-300 font-bold"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>إرسال الرسالة الآن</span>
                    </button>
                  </div>
                </form>

              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 3: BROADCAST */}
      {activeSubTab === 'broadcast' && (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm sm:text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#0D5C8C]" />
              بث إشعار أو تعميم عام وموسع
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              إرسال رسالة رسمية أو إعلان لكافة أولياء الأمور أو الطلاب المسجلين بالسنتر بضغطة زر واحدة.
            </p>
          </div>

          <form onSubmit={handleSendGeneralBroadcast} className="space-y-4 max-w-2xl">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">عنوان الإشعار / التعميم:</label>
              <input
                type="text"
                value={broadcastFormData.title}
                onChange={(e) => setBroadcastFormData({ ...broadcastFormData, title: e.target.value })}
                placeholder="مثال: موعد اختبارات شهر أكتوبر القادمة"
                className="w-full text-xs sm:text-sm border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-right focus:outline-none focus:border-[#0D5C8C]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">نوع القناة المستخدمة:</label>
                <select
                  value={broadcastFormData.category}
                  onChange={(e) => setBroadcastFormData({ ...broadcastFormData, category: e.target.value as any })}
                  className="w-full text-xs border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800"
                >
                  <option value="sms">رسائل SMS قصيرة</option>
                  <option value="system">إعلان نظامي عام</option>
                  <option value="alert">تنبيه عاجل</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">الفئة المستهدفة:</label>
                <select
                  value={broadcastFormData.recipient_type}
                  onChange={(e) => setBroadcastFormData({ ...broadcastFormData, recipient_type: e.target.value as any })}
                  className="w-full text-xs border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800"
                >
                  <option value="parents">جميع أولياء الأمور</option>
                  <option value="students">جميع الطلاب</option>
                  <option value="all">الكل (أولياء أمور وطلاب ومعلمين)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">نص التعميم / الإشعار:</label>
              <textarea
                value={broadcastFormData.message}
                onChange={(e) => setBroadcastFormData({ ...broadcastFormData, message: e.target.value })}
                rows={4}
                placeholder="يرجى كتابة نص البيان الموجه بدقة ووضوح..."
                className="w-full text-xs sm:text-sm border border-slate-200 dark:border-slate-700 p-3.5 rounded-xl text-right focus:outline-none focus:border-[#0D5C8C] min-h-[100px]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0D5C8C] hover:bg-[#1A7FAA] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Send className="w-4 h-4 text-sky-200" />
                <span>تأكيد وبث التعميم الآن</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: ARCHIVE LOGS */}
      {activeSubTab === 'logs' && (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
            <Bell className="w-4.5 h-4.5 text-[#0D5C8C]" />
            سجل حركة الاتصالات وبث الـ SMS الصادر بالألوان
          </h3>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="p-8 text-center text-slate-400 text-xs">لا توجد رسائل صادرة في السجل حالياً.</p>
            ) : (
              notifications.map((n) => {
                const icon = {
                  system: <Megaphone className="w-4 h-4 text-[#0D5C8C]" />,
                  sms: <MessageSquare className="w-4 h-4 text-emerald-600" />,
                  email: <Mail className="w-4 h-4 text-indigo-600" />,
                  alert: <AlertTriangle className="w-4 h-4 text-[#C0152A]" />
                }[n.category];

                const categoryLabel = {
                  system: 'إعلان نظامي عام',
                  sms: 'رسالة قصيرة SMS لهاتف ولي الأمر ',
                  email: 'بريد رسمي معتمد',
                  alert: 'تنبيه إداري فوري عاجل'
                }[n.category];

                return (
                  <div key={n.id} className="p-4 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl shrink-0 mt-0.5">
                        {icon}
                      </div>
                      <div className="space-y-1 text-right">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                          {n.title}
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">{categoryLabel}</span>
                        </h4>
                        <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl font-sans">{n.message}</p>
                        
                        {n.recipient_id && (
                          <p className="text-[10px] text-slate-400 font-bold">
                            الطالب المقصود: {students.find(st => st.id === n.recipient_id)?.name || 'ـ طالب مدقق ـ'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-left shrink-0 font-sans">
                      <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 justify-end">
                        <Calendar className="w-3.5 h-3.5" />
                        {n.created_at}
                      </span>
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-[10px] text-emerald-600 font-bold">تم البث والإرسال فوراً</span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* FLOATING SMS TRANSMISSION MONITOR OVERLAY */}
      {transmissionState.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
          <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-2xl max-w-sm w-full overflow-hidden flex flex-col p-4 sm:p-6 text-center space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-xs font-bold text-slate-400">إرسال تنبيه فوري</span>
              <button 
                type="button" 
                onClick={() => setTransmissionState(prev => ({ ...prev, isOpen: false }))} 
                disabled={transmissionState.status === 'connecting'} 
                className="text-slate-400 hover:text-slate-600 dark:text-slate-300 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>

            {transmissionState.status === 'connecting' && (
              <div className="py-6 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-[#0D5C8C]" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">جاري إرسال الرسالة الآن...</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">جاري إرسال النص إلى ولي الأمر ({transmissionState.parentName})</p>
              </div>
            )}

            {transmissionState.status === 'success' && (
              <div className="py-2 flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/40 rounded-full flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                  <CheckCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">تم تسجيل الإشعار وتوجيهه!</p>
                
                <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl text-right w-full border border-slate-100 dark:border-slate-700 space-y-1">
                  <div><b>المستلم:</b> {transmissionState.parentName}</div>
                  <div><b>الهاتف:</b> <span className="font-mono text-slate-800 dark:text-slate-100">{transmissionState.phone}</span></div>
                  <div className="pt-1.5 border-t border-slate-200/50 text-[10px] text-slate-500 dark:text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">
                    <b>الرسالة:</b> "{transmissionState.message}"
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTransmissionState(prev => ({ ...prev, isOpen: false }))}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs"
                >
                  تم
                </button>
              </div>
            )}

            {transmissionState.status === 'failed' && (
              <div className="py-2 flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/40 rounded-full flex items-center justify-center border border-red-100">
                  <ShieldAlert className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-sm font-bold text-red-600">تعذر تسليم الرسالة عبر البوابة</p>
                <button
                  type="button"
                  onClick={() => setTransmissionState(prev => ({ ...prev, isOpen: false }))}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs"
                >
                  إغلاق
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmState.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
          <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full overflow-hidden flex flex-col p-4 sm:p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/50 text-[#C0152A] rounded-2xl flex items-center justify-center mx-auto border border-red-200/60 dark:border-red-900/40">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2 text-center">
              <h3 className="text-base sm:text-sm sm:text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                {deleteConfirmState.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                {deleteConfirmState.description}
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={executeConfirmedDeletion}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-md shadow-red-500/20"
              >
                نعم، تأكيد الحذف
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmState(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
