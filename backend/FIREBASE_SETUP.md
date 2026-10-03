# Firebase Setup for SGBountyhunt Backend

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name it "SGBountyhunt" (or similar)
4. Continue through setup (enable Analytics if you want)
5. Create the project

## 2. Enable Firestore

1. In Firebase Console, go to **Build → Firestore Database**
2. Click "Create Database"
3. Choose:
   - Production mode
   - Region: `europe-west1` (or your closest region)
4. Create database

## 3. Get Service Account Key

1. Go to **Project Settings (⚙️) → Service Accounts**
2. Click "Generate New Private Key"
3. Save the JSON file as `backend/firebase-key.json`

⚠️ **Important**: Add `firebase-key.json` to `.gitignore` - it contains your private credentials!

## 4. Initialize Firestore Collections

You can initialize data in two ways:

### Option A: Use the Backend Admin Form
1. Start the backend: `npm start`
2. Open admin page: `http://localhost:4000/admin/admin.html`
3. Use the form to create events and troopers
4. This will automatically populate Firestore

### Option B: Manual Firestore Setup
1. In Firebase Console, go to Firestore
2. Create two collections manually:
   - `events`
   - `troopers`
3. Add documents with this structure:

**events** documents:
```json
{
  "name": "Tatooine Hunt",
  "details": "5 Troopers • Easy"
}
```

**troopers** documents:
```json
{
  "name": "Scout TK-421",
  "trooperId": "TK-421",
  "imageUrl": "https://...",
  "eventId": "event-doc-id"
}
```

## 5. Update Backend .env

Add to `backend/.env`:
```
FIREBASE_PROJECT_ID=your-project-id
```

## 6. Start Backend

```bash
cd backend
npm install
npm start
```

All API calls now use Firestore!

## Firestore Data Structure

```
firestore/
├── events/
│   ├── event1/
│   │   ├── name: "Tatooine Hunt"
│   │   └── details: "5 Troopers • Easy"
│   └── event2/
│       └── ...
└── troopers/
    ├── trooper1/
    │   ├── name: "Scout TK-421"
    │   ├── trooperId: "TK-421" (admin only)
    │   ├── imageUrl: "https://..."
    │   ├── eventId: "event1"
    │   └── createdAt: timestamp
    └── trooper2/
        └── ...
```

## Notes

- `trooperId` is stored in Firestore but hidden from public API
- Any authenticated Firebase user with proper rules can add/edit troopers
- Update Firestore security rules in Firebase Console as needed
