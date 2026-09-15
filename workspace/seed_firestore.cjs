const { initializeApp, getApps, getApp } = require('firebase/app');
const { initializeFirestore, memoryLocalCache, getFirestore, doc, setDoc } = require('firebase/firestore');
const firebaseConfig = require('./firebase-applet-config.json');

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = initializeFirestore(app, { localCache: memoryLocalCache() }, firebaseConfig.firestoreDatabaseId || undefined);

const COLLECTION_NAME = 'sams_system_store';

const sampleStudents = [
  {
    id: 'st-1',
    name: 'ياسمين محمد',
    registration_id: '20260001',
    grade_level: 'الأول الإعدادي',
    education_type: 'عام',
    class_id: 'cls-1',
    phone: '01010203166',
    parent_phone: '01099887766',
    status: 'active',
    gender: 'female',
    created_at: new Date().toISOString()
  },
  {
    id: 'st-2',
    name: 'أحمد محمود إبراهيم',
    registration_id: '20260002',
    grade_level: 'الثاني الثانوي',
    education_type: 'أزهر',
    class_id: 'cls-2',
    phone: '01122334455',
    parent_phone: '01234567890',
    status: 'active',
    gender: 'male',
    created_at: new Date().toISOString()
  },
  {
    id: 'st-3',
    name: 'فاطمة الزهراء علي',
    registration_id: '20260003',
    grade_level: 'الثاني الثانوي',
    education_type: 'أزهر',
    class_id: 'cls-2',
    phone: '01055443322',
    parent_phone: '01011223344',
    status: 'active',
    gender: 'female',
    created_at: new Date().toISOString()
  },
  {
    id: 'st-4',
    name: 'محمود حسن عبد الله',
    registration_id: '20260004',
    grade_level: 'الثالث الإعدادي',
    education_type: 'عام',
    class_id: 'cls-1',
    phone: '01233445566',
    parent_phone: '01098765432',
    status: 'active',
    gender: 'male',
    created_at: new Date().toISOString()
  }
];

const sampleClasses = [
  {
    id: 'cls-1',
    name: 'مجموعة الأول الإعدادي (أ)',
    grade_level: 'الأول الإعدادي',
    education_type: 'عام',
    schedule_days: ['الأحد', 'الأربعاء'],
    schedule_time: '14:00',
    max_students: 25
  },
  {
    id: 'cls-2',
    name: 'مجموعة الثاني الثانوي أزهر',
    grade_level: 'الثاني الثانوي',
    education_type: 'أزهر',
    schedule_days: ['الإثنين', 'الخميس'],
    schedule_time: '16:00',
    max_students: 25
  }
];

const sampleTeachers = [
  {
    id: 'tch-1',
    name: 'د. جمال',
    subject: 'اللغة العربية',
    phone: '01000000000',
    salary_type: 'percentage',
    salary_value: 70
  }
];

const sampleSubjects = [
  { id: 'sub-1', name: 'النحو والصرف', grade_level: 'الأول الإعدادي' },
  { id: 'sub-2', name: 'البلاغة والنصوص', grade_level: 'الثاني الثانوي' }
];

const sampleFees = [
  {
    id: 'fee-1',
    student_id: 'st-1',
    amount: 200,
    month: 'سبتمبر 2026',
    paid_date: '2026-09-01',
    receipt_number: 'REC-2026-1001',
    notes: 'سداد اشتراك الشهر'
  }
];

const sampleAttendance = [
  {
    id: 'att-1',
    student_id: 'st-1',
    class_id: 'cls-1',
    date: '2026-09-14',
    status: 'present'
  }
];

async function seed() {
  const now = Date.now();
  const dataToSeed = {
    'sams_v2_students': sampleStudents,
    'sams_v2_classes': sampleClasses,
    'sams_v2_teachers': sampleTeachers,
    'sams_v2_subjects': sampleSubjects,
    'sams_v2_fees': sampleFees,
    'sams_v2_attendance': sampleAttendance
  };

  for (const [key, val] of Object.entries(dataToSeed)) {
    const docRef = doc(db, COLLECTION_NAME, key);
    await setDoc(docRef, {
      payload: JSON.stringify(val),
      updatedAt: now
    }, { merge: true });
    console.log(`Seeded ${key} to Firestore.`);
  }
  console.log('Successfully seeded all initial data to Firebase Firestore!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
