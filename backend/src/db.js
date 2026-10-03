const fs = require('fs/promises');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

async function readDb() {
  const raw = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writeDb(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function getNextId(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return 1;
  }
  return Math.max(...items.map((item) => Number(item.id) || 0)) + 1;
}

async function getEvents() {
  const data = await readDb();
  return (data.events || []).map(e => {
    const characterCount = (data.assignments || []).filter(a => String(a.eventId) === String(e.id)).length;
    return { id: String(e.id), ...e, characterCount };
  });
}

async function getTroopersForEvent(eventId) {
  const data = await readDb();
  const assignments = (data.assignments || []).filter(a => String(a.eventId) === String(eventId));

  return assignments
    .map((assignment) => {
      const character = (data.characters || []).find(c => String(c.id) === String(assignment.characterId));
      if (!character) {
        return null;
      }

      return {
        id: String(character.id),
        name: character.name || 'Unknown',
        imageUrl: character.imageUrl || character.image || '',
        eventNumber: assignment.characterNumber || '',
      };
    })
    .filter(Boolean);
}

async function getAllTroopers() {
  const data = await readDb();
  return (data.troopers || []).map(t => ({ id: String(t.id), ...t }));
}

async function getEventById(eventId) {
  const data = await readDb();
  const event = (data.events || []).find(e => String(e.id) === String(eventId));
  return event ? { id: String(event.id), ...event } : null;
}

async function getCharacterById(characterId) {
  const data = await readDb();
  const character = (data.characters || []).find(c => String(c.id) === String(characterId));
  return character ? { id: String(character.id), ...character } : null;
}

async function getAssignmentsForEvent(eventId) {
  const data = await readDb();
  return (data.assignments || [])
    .filter(a => String(a.eventId) === String(eventId))
    .map(a => ({ id: String(a.id), ...a }));
}

async function createTrooper(payload) {
  const data = await readDb();
  if (!data.troopers) data.troopers = [];
  
  const id = getNextId(data.troopers);
  const trooper = { id, ...payload };
  data.troopers.push(trooper);
  
  await writeDb(data);
  
  const { trooperId, ...publicFields } = payload;
  return {
    created: trooper,
    public: { id: String(id), ...publicFields },
  };
}

async function eventExists(eventId) {
  const data = await readDb();
  return (data.events || []).some(e => String(e.id) === String(eventId));
}

async function characterExists(characterId) {
  const data = await readDb();
  return (data.characters || []).some(c => String(c.id) === String(characterId));
}

async function getCharacters() {
  const data = await readDb();
  return (data.characters || []).map(c => ({ id: String(c.id), ...c }));
}

async function createCharacter(payload) {
  const data = await readDb();
  if (!data.characters) data.characters = [];
  
  const id = getNextId(data.characters);
  const character = { id, ...payload };
  data.characters.push(character);
  
  await writeDb(data);
  return { id: String(id), name: payload.name, imageUrl: payload.imageUrl || payload.image || '' };
}

async function createEvent(payload) {
  const data = await readDb();
  if (!data.events) data.events = [];
  
  const id = getNextId(data.events);
  const event = { id, ...payload, eventDate: payload.eventDate || null, isActive: true, active: true };
  data.events.push(event);
  
  await writeDb(data);
  return { id: String(id), name: payload.name, eventDate: payload.eventDate || null, isActive: true, active: true };
}

async function deleteEvent(eventId) {
  const data = await readDb();
  if (!data.events) return { deleted: false, removedAssignments: 0 };

  const normalizedEventId = String(eventId);
  const eventIdx = data.events.findIndex(e => String(e.id) === normalizedEventId);
  if (eventIdx === -1) {
    return { deleted: false, removedAssignments: 0 };
  }

  data.events.splice(eventIdx, 1);

  const previousAssignments = Array.isArray(data.assignments) ? data.assignments : [];
  const keptAssignments = previousAssignments.filter(
    a => String(a.eventId) !== normalizedEventId
  );
  const removedAssignments = previousAssignments.length - keptAssignments.length;
  data.assignments = keptAssignments;

  await writeDb(data);
  return { deleted: true, removedAssignments };
}

async function countAssignmentsForEvent(eventId) {
  const data = await readDb();
  return (data.assignments || []).filter(a => String(a.eventId) === String(eventId)).length;
}

async function hasAssignmentForCharacterInEvent(characterId, eventId) {
  const data = await readDb();
  return (data.assignments || []).some(
    a => String(a.eventId) === String(eventId) && String(a.characterId) === String(characterId)
  );
}

async function getAssignments() {
  const data = await readDb();
  const charactersById = new Map((data.characters || []).map(c => [String(c.id), c]));
  const eventsById = new Map((data.events || []).map(e => [String(e.id), e]));
  const assignments = (data.assignments || []).map(a => {
    const character = charactersById.get(String(a.characterId));
    const event = eventsById.get(String(a.eventId));
    
    return {
      id: String(a.id),
      characterId: a.characterId,
      characterName: character?.name || 'Unknown',
      eventId: a.eventId,
      eventName: event?.name || 'Unknown',
      characterNumber: a.characterNumber,
    };
  });
  
  return assignments;
}

async function createAssignment(payload) {
  const data = await readDb();
  if (!data.assignments) data.assignments = [];
  
  const id = getNextId(data.assignments);
  const assignment = { id, ...payload };
  data.assignments.push(assignment);
  
  await writeDb(data);
  
  return {
    id: String(id),
    characterId: payload.characterId,
    characterName: payload.characterName || 'Unknown',
    eventId: payload.eventId,
    eventName: payload.eventName || 'Unknown',
    characterNumber: payload.characterNumber,
  };
}

async function deleteAssignment(assignmentId) {
  const data = await readDb();
  if (!data.assignments) return false;

  const idx = data.assignments.findIndex(a => String(a.id) === String(assignmentId));
  if (idx === -1) return false;

  data.assignments.splice(idx, 1);
  await writeDb(data);
  return true;
}

module.exports = {
  readDb,
  writeDb,
  getNextId,
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
