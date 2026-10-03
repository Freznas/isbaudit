require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

let db;
let adminAuth;

try {
  // Try to use Firebase
  const firebaseDb = require('./firebaseDb');
  const admin = require('firebase-admin');
  db = firebaseDb;
  adminAuth = admin.auth();
  console.log('Using Firebase backend');
} catch (error) {
  // Fall back to JSON
  console.warn('Firebase not available, falling back to JSON:', error.message);
  const localDb = require('./db');
  db = localDb;
}

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.use('/admin', express.static(path.join(__dirname, '..', 'public')));

app.get('/firebase-config.json', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'firebase-config.json'));
});

app.get('/', (_req, res) => {
  res.redirect('/admin/admin.html');
});

function validateTrooperPayload(payload) {
  const name = String(payload.name || '').trim();
  const trooperId = String(payload.trooperId || '').trim();
  const imageUrl = String(payload.imageUrl || '').trim();
  const eventId = String(payload.eventId || '').trim();

  if (!name) return 'name is required';
  if (!trooperId) return 'trooperId is required';
  if (!imageUrl) return 'imageUrl is required';
  if (!eventId) return 'eventId is required';

  return null;
}

function getAllowedAdminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function requireAdmin(req, res, next) {
  if (!adminAuth) {
    return res.status(503).json({ error: 'Admin auth is not configured' });
  }

  const authHeader = req.header('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const isAllowedEmail = decodedToken.email && getAllowedAdminEmails().includes(decodedToken.email);

    if (!isAllowedEmail) {
      return res.status(403).json({ error: 'Forbidden: email is not allowed' });
    }

    req.user = decodedToken;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.get('/api/admin/verify', requireAdmin, (req, res) => {
  res.json({ ok: true, email: req.user?.email || null });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/events', async (_req, res) => {
  try {
    const events = await db.getEvents();
    res.json(events || []);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to load events' });
  }
});

app.get('/api/events/:eventId/troopers', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    if (!eventId) {
      return res.status(400).json({ error: 'Invalid eventId' });
    }

    const troopers = await db.getTroopersForEvent(eventId);
    return res.json(troopers || []);
  } catch (error) {
    console.error('Error fetching troopers:', error);
    return res.status(500).json({ error: 'Failed to load troopers' });
  }
});

app.get('/api/admin/troopers', requireAdmin, async (_req, res) => {
  try {
    const troopers = await db.getAllTroopers();
    res.json(troopers || []);
  } catch (error) {
    console.error('Error fetching admin troopers:', error);
    res.status(500).json({ error: 'Failed to load admin troopers' });
  }
});

app.post('/api/admin/troopers', requireAdmin, async (req, res) => {
  try {
    const validationError = validateTrooperPayload(req.body || {});
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const eventId = req.body.eventId;
    const eventExists = await db.eventExists(eventId);
    if (!eventExists) {
      return res.status(400).json({ error: `eventId "${eventId}" does not exist` });
    }

    const result = await db.createTrooper(req.body);
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating trooper:', error);
    return res.status(500).json({ error: 'Failed to create trooper' });
  }
});

// New admin endpoints for character management

app.get('/api/admin/characters', requireAdmin, async (_req, res) => {
  try {
    const characters = await db.getCharacters();
    res.json(characters || []);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ error: 'Failed to load characters' });
  }
});

app.post('/api/admin/characters', requireAdmin, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const image = String(req.body.image || req.body.imageUrl || '').trim();
    const normalizedName = name.toLocaleLowerCase();

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    if (!image) {
      return res.status(400).json({ error: 'image is required' });
    }

    const existingCharacters = await db.getCharacters();
    const duplicate = (existingCharacters || []).some(
      (character) => String(character.name || '').trim().toLocaleLowerCase() === normalizedName
    );
    if (duplicate) {
      return res.status(409).json({ error: 'A character with this name already exists' });
    }

    const result = await db.createCharacter({ name, imageUrl: image, image });
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating character:', error);
    return res.status(500).json({ error: 'Failed to create character' });
  }
});

app.get('/api/admin/events', requireAdmin, async (_req, res) => {
  try {
    const events = await db.getEvents();
    res.json(events || []);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to load events' });
  }
});

app.post('/api/admin/events', requireAdmin, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const eventDate = String(req.body.eventDate || '').trim();

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const result = await db.createEvent({ name, eventDate, isActive: true, active: true });
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({ error: 'Failed to create event' });
  }
});

app.delete('/api/admin/events/:eventId', requireAdmin, async (req, res) => {
  try {
    const eventId = String(req.params.eventId || '').trim();
    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }

    const result = await db.deleteEvent(eventId);
    if (!result?.deleted) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json({
      ok: true,
      removedAssignments: Number(result.removedAssignments || 0),
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return res.status(500).json({ error: 'Failed to delete event' });
  }
});

app.get('/api/admin/assignments', requireAdmin, async (_req, res) => {
  try {
    const assignments = await db.getAssignments();
    res.json(assignments || []);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to load assignments' });
  }
});

app.post('/api/admin/assignments', requireAdmin, async (req, res) => {
  try {
    const characterId = String(req.body.characterId || '').trim();
    const eventId = String(req.body.eventId || '').trim();
    const characterNumber = String(req.body.characterNumber || '').trim();

    if (!characterId) {
      return res.status(400).json({ error: 'characterId is required' });
    }
    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }
    if (!characterNumber) {
      return res.status(400).json({ error: 'characterNumber is required' });
    }

    const [character, event, assignmentsForEvent] = await Promise.all([
      db.getCharacterById(characterId),
      db.getEventById(eventId),
      db.getAssignmentsForEvent(eventId),
    ]);

    if (!character) {
      return res.status(400).json({ error: 'Character does not exist' });
    }

    if (!event) {
      return res.status(400).json({ error: 'Event does not exist' });
    }

    const existingSameCharacterAssignment = (assignmentsForEvent || []).some(
      (assignment) => String(assignment.characterId) === characterId
    );
    if (existingSameCharacterAssignment) {
      return res.status(409).json({ error: 'This character is already assigned to this event' });
    }

    const eventAssignmentCount = (assignmentsForEvent || []).length;
    if (eventAssignmentCount >= 9) {
      return res.status(409).json({ error: 'This event already has 9 characters assigned' });
    }

    const result = await db.createAssignment({
      characterId,
      eventId,
      characterNumber,
      characterName: character.name || 'Unknown',
      eventName: event.name || 'Unknown',
    });
    return res.status(201).json(result);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ error: 'Failed to create assignment' });
  }
});

app.delete('/api/admin/assignments/:assignmentId', requireAdmin, async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    if (!assignmentId) return res.status(400).json({ error: 'assignmentId is required' });

    const success = await db.deleteAssignment(assignmentId);
    if (!success) return res.status(404).json({ error: 'Assignment not found' });

    return res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

app.use((error, _req, res, next) => {
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Image file too large. Please use a smaller image.' });
  }
  return next(error);
});

app.listen(PORT, () => {
  console.log(`SGBountyhunt backend running on http://localhost:${PORT}`);
  console.log('Admin page: http://localhost:' + PORT + '/admin/admin.html');
});
