# SGBountyhunt - Frontend Firestore Setup

Direct Firestore integration from frontend. No backend server needed!

## Quick Setup (5 minutes)

### 1. Create `.env.local` in User folder

From Firebase Console → Project Settings → Your apps → Web, copy your config:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=sgbountyhunt-2663c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sgbountyhunt-2663c
VITE_FIREBASE_STORAGE_BUCKET=sgbountyhunt-2663c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=667084431113
VITE_FIREBASE_APP_ID=1:667084431113:web:8d99d124ada6273c8afdd8
```

### 2. Update Firestore Security Rules

1. Firebase Console → Firestore Database → Rules
2. Replace with rules from: `FIRESTORE_SECURITY_RULES.md`
3. Publish

### 3. Start Frontend

```bash
cd User
npm run web
```

Open: `http://localhost:4000/admin/admin.html` (or your port)

### 4. Create Events & Troopers

1. Sign up with email/password
2. Fill in event/trooper forms
3. Data saves to Firestore automatically
4. Frontend automatically loads and displays them

## How It Works

```
Frontend
  ├── src/firebase.js (initialize SDK)
  ├── src/services/eventService.js (Firestore queries)
  └── public/admin.html (management UI)
     ↓
  Firestore
  ├── /events (public read)
  └── /troopers (public read, hides trooperId)
```

## Features

✅ **No backend server** - Frontend talks directly to Firestore
✅ **Real-time sync** - Changes appear instantly
✅ **Secure** - Firebase Auth + Firestore rules
✅ **Scalable** - Firestore handles traffic
✅ **Easy deployment** - Deploy frontend to Vercel as-is

## Deploy to Vercel

```bash
# Frontend folder
cd User
npm install
npm run build
# Deploy build/ folder to Vercel
```

Vercel automatically sets environment variables from `.env.local`.

## Files Added/Updated

```
User/
├── src/
│   ├── firebase.js              ✨ NEW (Firebase init)
│   ├── services/eventService.js ✏️ UPDATED (Firestore queries)
│   └── screens/EventSelectionScreen.jsx ✏️ UPDATED
├── public/
│   └── admin.html               ✨ NEW (Admin UI)
├── .env.example                 ✏️ UPDATED
└── .env.local                   ✨ CREATE THIS (your config)
```

## Testing Checklist

- [ ] Firebase project created
- [ ] Firestore enabled
- [ ] `.env.local` created with Firebase config
- [ ] Security rules applied
- [ ] Frontend started (`npm run web`)
- [ ] Admin page loads
- [ ] Can sign up / login
- [ ] Can create event
- [ ] Event appears in app event selection
- [ ] Can create trooper
- [ ] Trooper appears for event

## Troubleshooting

**"Events array is empty"**
- Check Firestore has events collection
- Admin page shows events but not in app? → App shows fallback data, Firestore might not be connected yet

**"Permission denied" in admin**
- Check Firestore rules are published
- Make sure you're signed in

**"Cannot read properties of undefined"**
- Check `.env.local` has all Firebase config values
- No typos in variable names (must start with `VITE_`)

## Next: Deploy to Vercel

1. Push repo to GitHub
2. Connect Vercel → Select User folder as root
3. Copy `.env.local` vars to Vercel Environment
4. Deploy

Done! App runs on Vercel with Firestore backend.
