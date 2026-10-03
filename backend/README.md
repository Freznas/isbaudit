# SGBountyhunt Backend

Express API for events and troopers with Firestore and Firebase Auth support.

## Quick Start

### Option 1: Firebase (Recommended for Production)

1. Follow [FIREBASE_COMPLETE_SETUP.md](../FIREBASE_COMPLETE_SETUP.md)
2. Run:
   ```bash
   npm install
   npm start
   ```

### Option 2: Local JSON (Development)

If you want to test without Firebase:

1. Update `src/dbProvider.js` to use local db.js instead of firebaseDb.js
2. Run:
   ```bash
   npm install
   npm start
   ```

## Data Structure

### Events
- `name`: Display name of the hunt
- `details`: Info like "5 Troopers • Easy"

### Troopers
- `name`: Trooper display name
- `trooperId`: Admin-only secret identifier (e.g., "TK-421")
- `imageUrl`: URL to trooper image
- `eventId`: Reference to event document ID
- `createdAt`: Server timestamp

## API Endpoints

### Public (Read-only)
- `GET /api/events` - List all events
- `GET /api/events/:eventId/troopers` - Get troopers for event (hides `trooperId`)

### Admin (Requires Authentication)
- `GET /api/admin/troopers` - List all troopers with hidden fields
- `POST /api/admin/troopers` - Create new trooper

## Authentication

### Firebase Auth (Recommended)
- Use Firebase identity tokens in header: `Authorization: Bearer <token>`
- Admin form at `http://localhost:4000/admin/admin.html` handles this automatically

### Fallback: Admin Key
- If Firebase unavailable, uses header: `x-admin-key: <key>`
- Key from `ADMIN_KEY` environment variable

## Admin Panel

Open: `http://localhost:4000/admin/admin.html`

- Sign up / login with Firebase Auth
- Or enter fallback admin key if Firebase not configured
- Create/view troopers
- Auto-loads events from database

## Environment Variables

```env
PORT=4000
ADMIN_KEY=fallback-admin-key
FIREBASE_PROJECT_ID=optional
```

See `.env.example`

