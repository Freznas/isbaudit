# Firebase Setup - Quick Start (3 Steps)

## Step 1: Create Firebase Project (5 min)

1. Go to https://console.firebase.google.com/
2. Click **"Add project"** → Name it `SGBountyhunt`
3. Go to **Build → Firestore Database** → Click **"Create Database"**
4. Choose **Production mode** → **Region: europe-west1** → **Create**

## Step 2: Get Credentials (3 min)

### Get Service Account Key
1. Settings ⚙️ → **Project Settings** → **Service Accounts** tab
2. Click **"Generate New Private Key"**
3. Save file as: `backend/firebase-key.json`

### Get Web Config
1. Settings ⚙️ → **General** tab
2. Scroll to **Your apps** → Click **Create app** (Web)
3. Copy the entire `firebaseConfig` object
4. Create file: `backend/public/firebase-config.json` and paste it

## Step 3: Run Backend (1 min)

```bash
cd backend
npm install  # Already done
npm start
```

Visit: `http://localhost:4000/admin/admin.html`

Sign up with email/password → Create troopers!

---

## Verify It Works

- [ ] Backend running on `http://localhost:4000`
- [ ] Admin panel loads and shows auth form
- [ ] Can sign up / login
- [ ] Can create a trooper
- [ ] Trooper appears in the table

Done! Data now lives in Firestore.

---

## Troubleshooting

**"Firebase initialization error"**
- Check `firebase-key.json` exists in `backend/` folder
- Check JSON is valid (no extra characters)

**"No collections in Firestore"**
- They're created automatically when you submit first trooper
- Or manually create them in Firebase Console

**Admin panel shows "fallback auth"**
- Firebase Config not found
- Check `backend/public/firebase-config.json` exists
- Restart backend after adding it

---

## Next: Mobile Testing

Update `User/.env`:
```
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.185:4000
```

Then scan the app QR code and events will load from live backend!
