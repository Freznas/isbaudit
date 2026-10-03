import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { apiRequest } from './api';

export async function getEvents() {
  const eventsCollection = collection(db, 'events');
  const snapshot = await getDocs(eventsCollection);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getTroopersByEventId(eventId) {
  const cacheKey = `sgbountyhunt-troopers-${eventId}`;
  const TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

  // Try to return cached value first (cache-first strategy)
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(cacheKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.data && parsed.ts && Date.now() - parsed.ts < TTL_MS) {
            return parsed.data;
          }
        } catch (e) {
          // ignore parse errors and fall through to fetch
        }
      }
    }
  } catch (e) {
    // ignore storage access errors
  }

  // No valid cache — fetch from backend and populate cache
  const result = await apiRequest(`/api/events/${encodeURIComponent(eventId)}/troopers`);

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const payload = { ts: Date.now(), data: result };
      window.localStorage.setItem(cacheKey, JSON.stringify(payload));
    }
  } catch (e) {
    // ignore storage write errors
  }

  return result;
}
