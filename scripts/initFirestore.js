import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

function loadServiceAccount() {
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.SERVICE_ACCOUNT_KEY_PATH;
  if (!envPath) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS or SERVICE_ACCOUNT_KEY_PATH to the service account JSON path.');
    process.exit(1);
  }
  const abs = path.isAbsolute(envPath) ? envPath : path.resolve(process.cwd(), envPath);
  if (!fs.existsSync(abs)) {
    console.error('Service account file not found at', abs);
    process.exit(1);
  }
  const raw = fs.readFileSync(abs, 'utf8');
  return JSON.parse(raw);
}

async function main() {
  const serviceAccount = loadServiceAccount();
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const db = admin.firestore();

  console.log('Creating initial Firestore documents...');

  // Users collection: create an admin placeholder
  const adminUid = 'admin-placeholder-uid';
  await db.collection('users').doc(adminUid).set({
    displayName: 'Site Admin',
    email: 'admin@example.com',
    townhall: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Events collection: sample event
  const eventRef = db.collection('events').doc();
  await eventRef.set({
    title: 'Welcome Event',
    description: 'Initial sample event created by init script',
    startsAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 3600 * 1000)),
    createdBy: adminUid,
    public: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Applications collection: sample application
  const appRef = db.collection('applications').doc();
  await appRef.set({
    userId: adminUid,
    status: 'approved',
    submittedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log('Initial documents created:');
  console.log('- users/', adminUid);
  console.log('- events/', eventRef.id);
  console.log('- applications/', appRef.id);
  console.log('Done. Be sure to replace placeholder admin UID/email and set real users.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Initialization failed:', err);
  process.exit(1);
});
