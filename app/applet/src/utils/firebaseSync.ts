import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION_NAME = 'sams_system_store';
let isLocalUpdate = false;

// Per-key debounce timers and pending payloads
const syncTimers: Record<string, ReturnType<typeof setTimeout>> = {};
const pendingPayloads: Record<string, any> = {};

// Sync local data to Firestore with debouncing to prevent write stream exhaustion
export function syncToFirebase(key: string, data: any) {
  pendingPayloads[key] = data;
  if (syncTimers[key]) {
    clearTimeout(syncTimers[key]);
  }
  syncTimers[key] = setTimeout(async () => {
    delete syncTimers[key];
    const payloadToSync = pendingPayloads[key];
    delete pendingPayloads[key];
    if (payloadToSync === undefined) return;
    try {
      isLocalUpdate = true;
      const docRef = doc(db, COLLECTION_NAME, key);
      const localTs = parseInt(localStorage.getItem(`${key}_ts`) || '0', 10) || Date.now();
      await setDoc(docRef, {
        payload: JSON.stringify(payloadToSync),
        updatedAt: localTs
      }, { merge: true });
    } catch (err: any) {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('resource-exhausted')) {
        console.warn(`[Firebase Sync Rate Limit] Quota or write stream queue limit for key "${key}". Throttled write.`);
      } else {
        console.error(`[Firebase Sync Error] Failed to sync key ${key}:`, err);
      }
    } finally {
      setTimeout(() => { isLocalUpdate = false; }, 300);
    }
  }, 600); // 600ms debounce prevents flooding Firestore write stream during batch operations
}

// Keys to listen and sync across devices
const ALL_SYNC_KEYS = [
  'sams_v2_students',
  'sams_v2_teachers',
  'sams_v2_classes',
  'sams_v2_subjects',
  'sams_v2_grades',
  'sams_v2_attendance',
  'sams_v2_fees',
  'sams_v2_notifications',
  'sams_v2_audit_logs',
  'sams_v2_current_user_role',
  'sams_v2_center_schedule',
  'sams_v2_exams',
  'sams_v2_assignments',
  'sams_v2_exam_grades',
  'sams_v2_assignment_grades',
  'sams_admin_notifications',
  'sams_salaries',
  'sams_system_users',
  'sams_grade_monthly_fees',
  // Alsafa System Keys
  'sams_v2_alsafa_students',
  'sams_v2_alsafa_teachers',
  'sams_v2_alsafa_classes',
  'sams_v2_alsafa_subjects',
  'sams_v2_alsafa_grades',
  'sams_v2_alsafa_attendance',
  'sams_v2_alsafa_fees',
  'sams_v2_alsafa_notifications',
  'sams_v2_alsafa_audit_logs',
  'sams_v2_alsafa_current_user_role',
  'sams_v2_alsafa_center_schedule',
  'sams_v2_alsafa_exams',
  'sams_v2_alsafa_assignments',
  'sams_v2_alsafa_exam_grades',
  'sams_v2_alsafa_assignment_grades',
  'sams_alsafa_salaries',
  'sams_alsafa_admin_notifications',
  'sams_alsafa_system_users',
  'sams_alsafa_grade_monthly_fees'
];

function seedSampleDataIfNeeded() {
  if (typeof window !== 'undefined' && !localStorage.getItem('sams_v2_students')) {
    const sampleStudents = [
      { id: 'st-1', name: 'ياسمين محمد', registration_id: '20260001', grade_level: 'الأول الإعدادي', education_type: 'عام', class_id: 'cls-1', phone: '01010203166', parent_phone: '01099887766', status: 'active', gender: 'female', created_at: new Date().toISOString() },
      { id: 'st-2', name: 'أحمد محمود إبراهيم', registration_id: '20260002', grade_level: 'الثاني الثانوي', education_type: 'أزهر', class_id: 'cls-2', phone: '01122334455', parent_phone: '01234567890', status: 'active', gender: 'male', created_at: new Date().toISOString() },
      { id: 'st-3', name: 'فاطمة الزهراء علي', registration_id: '20260003', grade_level: 'الثاني الثانوي', education_type: 'أزهر', class_id: 'cls-2', phone: '01055443322', parent_phone: '01011223344', status: 'active', gender: 'female', created_at: new Date().toISOString() },
      { id: 'st-4', name: 'محمود حسن عبد الله', registration_id: '20260004', grade_level: 'الثالث الإعدادي', education_type: 'عام', class_id: 'cls-1', phone: '01233445566', parent_phone: '01098765432', status: 'active', gender: 'male', created_at: new Date().toISOString() }
    ];
    const sampleClasses = [
      { id: 'cls-1', name: 'مجموعة الأول الإعدادي (أ)', grade_level: 'الأول الإعدادي', education_type: 'عام', schedule_days: ['الأحد', 'الأربعاء'], schedule_time: '14:00', max_students: 25 },
      { id: 'cls-2', name: 'مجموعة الثاني الثانوي أزهر', grade_level: 'الثاني الثانوي', education_type: 'أزهر', schedule_days: ['الإثنين', 'الخميس'], schedule_time: '16:00', max_students: 25 }
    ];
    const sampleTeachers = [
      { id: 'tch-1', name: 'د. جمال', subject: 'اللغة العربية', phone: '01000000000', salary_type: 'percentage', salary_value: 70 }
    ];
    const sampleSubjects = [
      { id: 'sub-1', name: 'النحو والصرف', grade_level: 'الأول الإعدادي' },
      { id: 'sub-2', name: 'البلاغة والنصوص', grade_level: 'الثاني الثانوي' }
    ];
    const sampleFees = [
      { id: 'fee-1', student_id: 'st-1', amount: 200, month: 'سبتمبر 2026', paid_date: '2026-09-01', receipt_number: 'REC-2026-1001', notes: 'سداد اشتراك الشهر' }
    ];
    const sampleAttendance = [
      { id: 'att-1', student_id: 'st-1', class_id: 'cls-1', date: '2026-09-14', status: 'present' }
    ];

    localStorage.setItem('sams_v2_students', JSON.stringify(sampleStudents));
    localStorage.setItem('sams_v2_classes', JSON.stringify(sampleClasses));
    localStorage.setItem('sams_v2_teachers', JSON.stringify(sampleTeachers));
    localStorage.setItem('sams_v2_subjects', JSON.stringify(sampleSubjects));
    localStorage.setItem('sams_v2_fees', JSON.stringify(sampleFees));
    localStorage.setItem('sams_v2_attendance', JSON.stringify(sampleAttendance));
  }
}

let isInitialized = false;

export function initFirebaseSync(onSyncStatusChange?: (status: 'connected' | 'syncing' | 'error') => void) {
  if (isInitialized) return;
  isInitialized = true;
  if (onSyncStatusChange) onSyncStatusChange('syncing');

  seedSampleDataIfNeeded();
  forcePushLocalToCloud();

  // Register beforeunload to save any pending writes immediately
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      forcePushLocalToCloudSync();
    });
  }

  // Stagger initialization across keys to avoid firing 19 simultaneous getDoc calls
  ALL_SYNC_KEYS.forEach((key, index) => {
    setTimeout(() => {
      const docRef = doc(db, COLLECTION_NAME, key);
      // Initial check: If local exists but remote does not, upload local to Firestore
      getDoc(docRef).then((snapshot) => {
        if (!snapshot.exists()) {
          const localVal = localStorage.getItem(key);
          if (localVal) {
            try {
              syncToFirebase(key, JSON.parse(localVal));
            } catch (e) {
              // Ignore JSON parse errors for non-JSON strings
            }
          }
        }
      }).catch(err => console.warn(`[Firebase Sync Fetch Warning] ${key}:`, err?.message || err));

      // Real-time listener across devices
      onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data && data.payload) {
            const currentLocal = localStorage.getItem(key);
            const remoteTs = data.updatedAt || 0;
            const localTs = parseInt(localStorage.getItem(`${key}_ts`) || '0', 10);
            if (currentLocal !== data.payload) {
              // If local timestamp is strictly greater than remote timestamp, 
              // it means local data is newer and a sync was likely interrupted.
              if (localTs > remoteTs) {
                try { 
                   syncToFirebase(key, JSON.parse(currentLocal));
                } catch(e) {}
              } else {
                // Otherwise, it's safe to overwrite local with remote
                localStorage.setItem(key, data.payload);
                localStorage.setItem(`${key}_ts`, remoteTs.toString());
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('sams_db_sync', { detail: { key, remote: true } }));
                }
              }
            }
          }
        }
        if (onSyncStatusChange) onSyncStatusChange('connected');
      }, (error) => {
        console.warn(`[Firebase Sync Listener Warning] ${key}:`, error?.message || error);
        if (onSyncStatusChange) onSyncStatusChange('error');
      });
    }, index * 40); // 40ms stagger
  });
}

// Synchronous push for beforeunload to ensure no data loss on refresh
function forcePushLocalToCloudSync() {
  for (const key of Object.keys(pendingPayloads)) {
    const payloadToSync = pendingPayloads[key];
    if (payloadToSync !== undefined) {
      const localTs = parseInt(localStorage.getItem(`${key}_ts`) || '0', 10) || Date.now();
      // Use standard sync since we can't await in beforeunload, but firestore JS SDK might process it.
      const docRef = doc(db, COLLECTION_NAME, key);
      setDoc(docRef, {
        payload: JSON.stringify(payloadToSync),
        updatedAt: localTs
      }, { merge: true }).catch(() => {});
    }
  }
}

// Force full cloud push of all current local data
export async function forcePushLocalToCloud() {
  for (const key of ALL_SYNC_KEYS) {
    const localVal = localStorage.getItem(key);
    if (localVal) {
      try {
        syncToFirebase(key, JSON.parse(localVal));
      } catch (e) {
        // Ignore
      }
    }
  }
}
