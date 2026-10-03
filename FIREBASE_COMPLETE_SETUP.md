# Firebase Setup Instructions

## Step 1: Create a Firebase Project

1. Go to https://console.firebase.google.com/
2. Click **"Add project"** (or **"Create a project"**)
3. Name it: `SGBountyhunt` (or your preferred name)
4. Click through the setup (you can disable Analytics if you want)
5. Create the project and wait for it to complete

## Step 2: Enable Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **"Create Database"**
3. Choose:
   - **Production mode** (you can change rules later)
   - **Region**: `europe-west1` (or your closest region)
4. Click **"Create"** and wait for Firestore to initialize

## Step 3: Get Service Account Key

1. Click the **⚙️ Settings** icon (top-left)
2. Go to **Project Settings** → **Service Accounts** tab
3. Click **"Generate New Private Key"**
4. A JSON file will download - **save it as `backend/firebase-key.json`**

⚠️ **IMPORTANT**: Add `firebase-key.json` to `.gitignore` - it contains private credentials!

```bash
# In backend/.gitignore (create if doesn't exist)
firebase-key.json
```

## Step 4: Get Firebase Web Config

1. In Firebase Console, click the **⚙️ Settings** icon again
2. Go to **General** tab
3. Scroll down to **Your apps** section
4. Click **Create app** if you haven't - choose **Web**
5. Copy the `firebaseConfig` object
6. Create a new file: `backend/public/firebase-config.json`
7. Paste the config (example format):

```json
{
  "apiKey": "AIzaSyD...",
  "authDomain": "sgbountyhunt-abc123.firebaseapp.com",
  "projectId": "sgbountyhunt-abc123",
  "storageBucket": "sgbountyhunt-abc123.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcdef123456"
}
```

## Step 5: Initialize Firestore Collections

Two options:

### Option A: Use Backend Admin Panel (Recommended)
1. In a terminal, go to `backend` folder
2. Run: `npm install`
3. Run: `npm start`
4. Open: `http://localhost:4000/admin/admin.html`
5. Sign up / login with Firebase
6. Use the form to create events and troopers

### Option B: Manual Setup in Firestore Console
1. In Firebase Console, go to **Firestore Database**
2. Click **"Start Collection"** and create collection: `events`
3. Add documents with this structure:

```json
{
  "name": "Tatooine Hunt",
  "details": "5 Troopers • Easy"
}
```

4. Create another collection: `troopers`
5. Add documents:

```json
{
  "name": "Scout TK-421",
  "trooperId": "TK-421",
  "imageUrl": "https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&w=900&q=80",
  "eventId": "<paste the event doc ID from step 3>"
}
```

## Step 6: Update Firestore Security Rules

In Firebase Console → **Firestore Database** → **Rules** tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access
    match /events/{document=**} {
      allow read;
    }
    match /troopers/{document=**} {
      allow read;
    }

    // Admin write access (authenticated users only)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Click **Publish** to apply.

## Step 7: Run the Backend

```bash
cd backend
npm install
npm start
```

Backend will output:
```
Firebase initialized successfully
SGBountyhunt backend running on http://localhost:4000
Admin page: http://localhost:4000/admin/admin.html
```

## Step 8: Update Frontend API URL

Create `User/.env`:
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

For mobile testing, use your LAN IP:
```
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.185:4000
```

## Troubleshooting

**Error: "Firebase initialization error"**
- Check that `backend/firebase-key.json` exists and has correct content
- Verify JSON is valid (use an online JSON validator)

**Error: "Permission denied" when creating/reading data**
- Check Firestore security rules in Firebase Console
- Ensure you're authenticated before making admin requests

**Events/troopers not showing in admin panel**
- Verify collections exist in Firestore
- Check browser console for errors (F12)
- Try creating a trooper through admin form - it will create collections automatically

**Data not syncing**
- Make sure backend is running and `http://localhost:4000/api/events` returns data
- Check that frontend `.env` has correct API URL
