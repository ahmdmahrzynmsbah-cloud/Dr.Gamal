import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION_NAME = 'sams_system_store';
let isLocalUpdate = false;

// Sync local data to Firestore
export async function syncToFirebase(key: string, data: any) {
  try {
    isLocalUpdate = true;
    const docRef = doc(db, COLLECTION_NAME, key);
    await setDoc(docRef, {
      payload: JSON.stringify(data),
      updatedAt: Date.now()
    }, { merge: true });
  } catch (err) {
    console.error(`[Firebase Sync Error] Failed to sync key ${key}:`, err);
  } finally {
    setTimeout(() => { isLocalUpdate = false; }, 300);
  }
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
  'sams_admin_notifications'
];

let isInitialized = false;

export function initFirebaseSync(onSyncStatusChange?: (status: 'connected' | 'syncing' | 'error') => void) {
  if (isInitialized) return;
  isInitialized = true;

  if (onSyncStatusChange) onSyncStatusChange('syncing');

  // Set up listeners for all data keys
  ALL_SYNC_KEYS.forEach((key) => {
    const docRef = doc(db, COLLECTION_NAME, key);

    // Initial check: If local exists but remote does not, upload local to Firestore
    getDoc(docRef).then((snapshot) => {
      if (!snapshot.exists()) {
        const localVal = localStorage.getItem(key);
        if (localVal) {
          try {
            setDoc(docRef, {
              payload: localVal,
              updatedAt: Date.now()
            });
          } catch (e) {
            console.error('Error seeding firebase key:', key, e);
          }
        }
      }
    }).catch(err => console.error('Error fetching doc:', key, err));

    // Real-time listener across devices
    onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.payload) {
          const currentLocal = localStorage.getItem(key);
          if (currentLocal !== data.payload) {
            localStorage.setItem(key, data.payload);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('sams_db_sync', { detail: { key, remote: true } }));
            }
          }
        }
      }
      if (onSyncStatusChange) onSyncStatusChange('connected');
    }, (error) => {
      console.error(`[Firebase Sync Listener Error] ${key}:`, error);
      if (onSyncStatusChange) onSyncStatusChange('error');
    });
  });
}

// Force full cloud push of all current local data
export async function forcePushLocalToCloud() {
  for (const key of ALL_SYNC_KEYS) {
    const localVal = localStorage.getItem(key);
    if (localVal) {
      try {
        const docRef = doc(db, COLLECTION_NAME, key);
        await setDoc(docRef, {
          payload: localVal,
          updatedAt: Date.now()
        });
      } catch (e) {
        console.error('Error force pushing key:', key, e);
      }
    }
  }
}
