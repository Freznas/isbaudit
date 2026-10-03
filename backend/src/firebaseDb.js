const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'firebase-key.json');

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('Firebase initialized successfully with service account key');
  } else {
    admin.initializeApp();
    console.log('Firebase initialized successfully with application default credentials');
  }
} catch (error) {
  console.error(
    'Firebase initialization error. Make sure firebase-key.json is in the backend directory.',
    error.message
  );
  process.exit(1);
}

const db = admin.firestore();

async function getEvents() {
  const snapshot = await db.collection('events').get();
  const assignmentsSnapshot = await db.collection('assignments').get();
  const assignmentsByEventId = new Map();

  assignmentsSnapshot.docs.forEach((assignmentDoc) => {
    const assignment = assignmentDoc.data();
    const eventId = String(assignment.eventId || '');
    assignmentsByEventId.set(eventId, (assignmentsByEventId.get(eventId) || 0) + 1);
  });

  const events = [];

  for (const doc of snapshot.docs) {
    events.push({
      id: doc.id,
      ...doc.data(),
      characterCount: assignmentsByEventId.get(String(doc.id)) || 0,
    });
  }

  return events;
}

async function getTroopersForEvent(eventId) {
  const assignmentSnapshot = await db.collection('assignments').where('eventId', '==', eventId).get();

  const resolvedCharacters = await Promise.all(
    assignmentSnapshot.docs.map(async (assignmentDoc) => {
      const assignment = assignmentDoc.data();
      const characterSnap = await db.collection('characters').doc(String(assignment.characterId)).get();
      const characterData = characterSnap.data();

      if (!characterData) {
        return null;
      }

      return {
        id: characterSnap.id,
        name: characterData.name || 'Unknown',
        imageUrl: characterData.imageUrl || characterData.image || '',
        eventNumber: assignment.characterNumber || '',
      };
    })
  );

  return resolvedCharacters.filter(Boolean);
}

async function getAllTroopers() {
  const snapshot = await db.collection('troopers').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getEventById(eventId) {
  const doc = await db.collection('events').doc(String(eventId)).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function getCharacterById(characterId) {
  const doc = await db.collection('characters').doc(String(characterId)).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function getAssignmentsForEvent(eventId) {
  const snapshot = await db.collection('assignments').where('eventId', '==', String(eventId)).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function createTrooper(payload) {
  const docRef = await db.collection('troopers').add({
    name: payload.name,
    trooperId: payload.trooperId,
    imageUrl: payload.imageUrl,
    eventId: payload.eventId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  const { trooperId, ...publicFields } = payload;

  return {
    created: { id: docRef.id, ...payload },
    public: { id: docRef.id, ...publicFields },
  };
}

async function eventExists(eventId) {
  const doc = await db.collection('events').doc(eventId).get();
  return doc.exists;
}

async function characterExists(characterId) {
  const doc = await db.collection('characters').doc(characterId).get();
  return doc.exists;
}

async function getCharacters() {
  const snapshot = await db.collection('characters').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function createCharacter(payload) {
  const imageUrl = payload.imageUrl || payload.image;
  const docRef = await db.collection('characters').add({
    name: payload.name,
    imageUrl,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { id: docRef.id, name: payload.name, imageUrl };
}

async function createEvent(payload) {
  const docRef = await db.collection('events').add({
    name: payload.name,
    eventDate: payload.eventDate || null,
    isActive: true,
    active: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    id: docRef.id,
    name: payload.name,
    eventDate: payload.eventDate || null,
    isActive: true,
    active: true,
  };
}

async function deleteEvent(eventId) {
  const normalizedEventId = String(eventId);
  const eventRef = db.collection('events').doc(normalizedEventId);
  const eventDoc = await eventRef.get();

  if (!eventDoc.exists) {
    return { deleted: false, removedAssignments: 0 };
  }

  const assignmentsSnapshot = await db
    .collection('assignments')
    .where('eventId', '==', normalizedEventId)
    .get();

  const batch = db.batch();
  batch.delete(eventRef);
  assignmentsSnapshot.docs.forEach((assignmentDoc) => {
    batch.delete(assignmentDoc.ref);
  });
  await batch.commit();

  return { deleted: true, removedAssignments: assignmentsSnapshot.size };
}

async function countAssignmentsForEvent(eventId) {
  const snapshot = await db.collection('assignments').where('eventId', '==', eventId).get();
  return snapshot.size;
}

async function hasAssignmentForCharacterInEvent(characterId, eventId) {
  const snapshot = await db
    .collection('assignments')
    .where('eventId', '==', eventId)
    .where('characterId', '==', characterId)
    .limit(1)
    .get();
  return !snapshot.empty;
}

async function getAssignments() {
  const snapshot = await db.collection('assignments').get();
  const charactersSnapshot = await db.collection('characters').get();
  const eventsSnapshot = await db.collection('events').get();
  const charactersById = new Map(
    charactersSnapshot.docs.map((doc) => [String(doc.id), doc.data()])
  );
  const eventsById = new Map(
    eventsSnapshot.docs.map((doc) => [String(doc.id), doc.data()])
  );
  const assignments = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const character = charactersById.get(String(data.characterId));
    const event = eventsById.get(String(data.eventId));

    assignments.push({
      id: doc.id,
      characterId: data.characterId,
      characterName: character?.name || 'Unknown',
      eventId: data.eventId,
      eventName: event?.name || 'Unknown',
      characterNumber: data.characterNumber,
    });
  }

  return assignments;
}

async function createAssignment(payload) {
  const docRef = await db.collection('assignments').add({
    characterId: payload.characterId,
    eventId: payload.eventId,
    characterNumber: payload.characterNumber,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    id: docRef.id,
    characterId: payload.characterId,
    characterName: payload.characterName || 'Unknown',
    eventId: payload.eventId,
    eventName: payload.eventName || 'Unknown',
    characterNumber: payload.characterNumber,
  };
}

async function deleteAssignment(assignmentId) {
  const docRef = db.collection('assignments').doc(String(assignmentId));
  const doc = await docRef.get();
  if (!doc.exists) return false;
  await docRef.delete();
  return true;
}

module.exports = {
  db,
  getEvents,
  getTroopersForEvent,
  getAllTroopers,
  getEventById,
  getCharacterById,
  getAssignmentsForEvent,
  createTrooper,
  eventExists,
  characterExists,
  getCharacters,
  createCharacter,
  createEvent,
  deleteEvent,
  countAssignmentsForEvent,
  hasAssignmentForCharacterInEvent,
  getAssignments,
  createAssignment,
  deleteAssignment,
};
