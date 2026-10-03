// Usage: node src/scripts/set-admin-claim.js user@example.com [true|false]
const admin = require('firebase-admin');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.error('Usage: node src/scripts/set-admin-claim.js user@example.com [true|false]');
    process.exit(2);
  }

  const email = args[0];
  const makeAdmin = args[1] !== 'false';

  // Initialize admin SDK using existing firebase-key.json in backend/ if not already initialized
  try {
    if (!admin.apps.length) {
      const serviceAccountPath = path.join(__dirname, '..', '..', 'firebase-key.json');
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
  } catch (err) {
    console.error('Failed to initialize Firebase Admin SDK. Make sure firebase-key.json exists in the backend folder.');
    console.error(err.message || err);
    process.exit(1);
  }

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const uid = userRecord.uid;
    if (makeAdmin) {
      await admin.auth().setCustomUserClaims(uid, { admin: true });
      console.log(`Set admin claim for ${email} (uid: ${uid})`);
    } else {
      await admin.auth().setCustomUserClaims(uid, { admin: false });
      console.log(`Removed admin claim for ${email} (uid: ${uid})`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error setting admin claim:', err.message || err);
    process.exit(1);
  }
}

main();
