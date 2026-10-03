// API service - Handle all backend API calls

import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getRuntimeHostName() {
	const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.hostUri || Constants.manifest?.debuggerHost || '';
	if (!hostUri || typeof hostUri !== 'string') {
		return '';
	}

	return hostUri.split(':')[0].replace(/^exp\+/, '');
}

const runtimeHostName = getRuntimeHostName();

function getWebHostName() {
	if (typeof window === 'undefined' || !window.location?.hostname) {
		return '';
	}

	// Prefer hostname, fallback to parsing host/origin for environments
	if (window.location.hostname) return window.location.hostname;
	if (window.location.host) return window.location.host.split(':')[0];
	try {
		return new URL(window.location.origin).hostname;
	} catch (e) {
		return '';
	}
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || (() => {
	if (Platform.OS === 'web') {
		// For production web (Vercel), must set EXPO_PUBLIC_API_BASE_URL environment variable
		// Example: https://sgbountyhunt-backend-xxxx.run.app
		const host = getWebHostName();
		if (host && !host.includes('vercel.app')) {
			// Development web: use same host
			return `http://${host}:4000`;
		}
		// Production web on Vercel: must be set via env var
		console.warn('EXPO_PUBLIC_API_BASE_URL not set for production deployment');
		return 'https://backend-url-not-configured.invalid';
	}

	if (runtimeHostName) {
		return `http://${runtimeHostName}:4000`;
	}

	return 'http://192.168.1.187:4000';
})();

// Helpful runtime log for debugging mobile web fetch issues
if (typeof window !== 'undefined' && window?.console?.info) {
	try {
		console.info('API_BASE_URL resolved to', API_BASE_URL);
	} catch (e) {
		// ignore
	}
}

async function apiRequest(path, options = {}) {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...(options.headers || {}),
		},
		...options,
	});

	if (!response.ok) {
		let message = `Request failed with status ${response.status}`;
		try {
			const errorPayload = await response.json();
			if (errorPayload && errorPayload.error) {
				message = errorPayload.error;
			}
		} catch (_error) {
			// Ignore JSON parse errors and use fallback message.
		}
		throw new Error(message);
	}

	if (response.status === 204) {
		return null;
	}

	return response.json();
}

export { API_BASE_URL, apiRequest };
