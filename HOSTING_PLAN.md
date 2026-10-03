# SGBountyhunt Hosting Plan: Firebase Cloud Run + Vercel

## Architecture Overview
```
┌─────────────────┐         ┌──────────────────┐
│   Vercel        │         │   Firebase       │
│  (Frontend)     │◄────────┤  (Backend)       │
│  User app       │         │  Cloud Run       │
└─────────────────┘         │  + Firestore     │
                            │  + Auth          │
                            └──────────────────┘
```

## Deployment Steps

### Phase 1: Prepare Backend for Cloud Run

1. **Ensure Dockerfile exists** (`backend/Dockerfile`)
   - Cloud Run needs a Dockerfile to build and run your service
   - Should expose port 4000 (or env-configurable)

2. **Update backend/.env for production**
   - Keep `ADMIN_EMAILS` configured
   - `PORT=4000` (Cloud Run will bind dynamically, but backend should listen here)
   - Ensure `firebase-key.json` is accessible (handled by Cloud Build secrets)

3. **Create `.gcloudignore`** (optional but recommended)
   - Ignore `node_modules`, `.git`, etc. to speed up deploy

4. **Deploy backend to Cloud Run**
   ```bash
   gcloud run deploy sgbountyhunt-backend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```
   - Note: This will give you a public URL like `https://sgbountyhunt-backend-xxxx.run.app`

### Phase 2: Update Frontend for Vercel

1. **Update API_BASE_URL in frontend** (`User/src/services/api.js`)
   - Replace `localhost:4000` with your Cloud Run backend URL
   - Example: `https://sgbountyhunt-backend-xxxx.run.app`

2. **Create `vercel.json` in `User/` folder** (optional, for custom deploy config)

3. **Deploy frontend to Vercel**
   ```bash
   cd User
   npm install -g vercel
   vercel --prod
   ```
   - Vercel will ask for project name and settings
   - You'll get a URL like `https://sgbountyhunt.vercel.app`

### Phase 3: Secure Backend in Cloud Run (Optional but Recommended)

1. **Make backend require authentication**
   - Remove `--allow-unauthenticated` flag
   - Use Google Cloud IAM to grant frontend service account access
   - Or use a simple API key header for frontend requests

2. **Set Cloud Run environment variables**
   - `ADMIN_EMAILS` (set via `gcloud run deploy` with `--set-env-vars`)
   - Ensure `firebase-key.json` is available as a secret (handled by Cloud Build)

## Key Environment Variables

### Backend (Cloud Run)
```env
PORT=4000
ADMIN_EMAILS=joakim8904@gmail.com,28599@swedishgarrison.se,5573@swedishgarrison.se
```

### Frontend (Vercel)
```env
VITE_API_BASE_URL=https://sgbountyhunt-backend-xxxx.run.app
```

## Costs (Rough Estimate)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Cloud Run | 2M requests/month | ~$0.40 per 1M requests + compute time |
| Firestore | 1GB storage, 50K reads/day | Pay as you go |
| Firebase Auth | Unlimited free tier | Free |
| Vercel | 100GB bandwidth/month | $20+/month or per-usage |

For a small app with a few admins and low player traffic, you should stay well within free tiers.

## Deployment Checklist

- [ ] Backend has working `firebase-key.json` (keep it secret in Cloud Build)
- [ ] Backend listens on configurable `PORT` env var
- [ ] Frontend `api.js` uses env-based `API_BASE_URL`
- [ ] `ADMIN_EMAILS` list is correct in backend env
- [ ] Test admin login with allowed email before going live
- [ ] Frontend and backend URLs are correctly configured in each other
- [ ] Firebase Hosting can optionally serve frontend as well, but Vercel is simpler

## Next Steps

1. Ensure `backend/Dockerfile` exists (I can create it)
2. Ensure `User/.env` or config has `VITE_API_BASE_URL` set correctly
3. Set up Google Cloud project if not already done
4. Deploy backend to Cloud Run first
5. Update frontend API URL and deploy to Vercel

---
Created: May 5, 2026
For: SGBountyhunt
