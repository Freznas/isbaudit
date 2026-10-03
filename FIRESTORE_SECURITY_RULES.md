# Firestore Security Rules

Add these rules to Firestore in Firebase Console → Firestore → Rules tab.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access for events and troopers
    match /events/{document=**} {
      allow read;
    }
    match /troopers/{document=**} {
      allow read;
    }

    // Admin write access (authenticated users only)
    match /events/{document=**} {
      allow write: if request.auth != null;
    }
    match /troopers/{document=**} {
      allow write: if request.auth != null;
    }
  }
}
```

This ensures:
- Anyone can read events and troopers (public API)
- Only authenticated users can create/edit/delete (admin)
- `trooperId` field is still in Firestore but frontend hides it from users

To restrict admin further, you could add custom claims or a whitelist.
