import { doc, setDoc, onSnapshot } from 'firebase/firestore';
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
      } else if (err?.code === 'unavailable' || err?.message?.includes('unavailable')) {
        console.warn(`[Firebase Sync Offline] Network currently unavailable for key "${key}". Data saved locally.`);
      } else {
        console.warn(`[Firebase Sync Note] Key ${key}:`, err?.message || err);
      }
    } finally {
      setTimeout(() => { isLocalUpdate = false; }, 300);
    }
  }, 600);
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

let isInitialized = false;
let syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function notifyDbSync(key: string) {
  if (typeof window === 'undefined') return;
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => {
    syncDebounceTimer = null;
    window.dispatchEvent(new CustomEvent('sams_db_sync', { detail: { key, remote: true } }));
  }, 100);
}

let hasNotifiedConnected = false;

export function initFirebaseSync(onSyncStatusChange?: (status: 'connected' | 'syncing' | 'error') => void) {
  if (isInitialized) return;
  isInitialized = true;

  if (onSyncStatusChange) onSyncStatusChange('syncing');

  // Register beforeunload to save any pending writes immediately
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      forcePushLocalToCloudSync();
    });
  }

  // Asynchronously attach listeners without blocking the main thread or freezing UI
  setTimeout(() => {
    ALL_SYNC_KEYS.forEach((key, index) => {
      setTimeout(() => {
        try {
          const docRef = doc(db, COLLECTION_NAME, key);

          onSnapshot(docRef, (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              if (data && data.payload) {
                const currentLocal = localStorage.getItem(key);
                const remoteTs = data.updatedAt || 0;
                const localTs = parseInt(localStorage.getItem(`${key}_ts`) || '0', 10);

                if (currentLocal !== data.payload) {
                  if (localTs > remoteTs) {
                    try {
                      syncToFirebase(key, JSON.parse(currentLocal));
                    } catch (e) {}
                  } else {
                    localStorage.setItem(key, data.payload);
                    localStorage.setItem(`${key}_ts`, remoteTs.toString());
                    notifyDbSync(key);
                  }
                }
              }
            } else {
              const localVal = localStorage.getItem(key);
              if (localVal) {
                try {
                  syncToFirebase(key, JSON.parse(localVal));
                } catch (e) {}
              }
            }
            if (onSyncStatusChange && !hasNotifiedConnected) {
              hasNotifiedConnected = true;
              onSyncStatusChange('connected');
            }
          }, () => {
            if (onSyncStatusChange && !hasNotifiedConnected) {
              hasNotifiedConnected = true;
              onSyncStatusChange('connected');
            }
          });
        } catch {
          // Safe catch
        }
      }, index * 10);
    });
  }, 100);
}

// Synchronous push for beforeunload to ensure no data loss on refresh
function forcePushLocalToCloudSync() {
  for (const key of Object.keys(pendingPayloads)) {
    const payloadToSync = pendingPayloads[key];
    if (payloadToSync !== undefined) {
      const localTs = parseInt(localStorage.getItem(`${key}_ts`) || '0', 10) || Date.now();
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
