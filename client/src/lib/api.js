import { supabase } from './supabase.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Enhanced fetch wrapper that attaches current Supabase JWT token and parses JSON envelope.
 */
export async function apiRequest(endpoint, { method = 'GET', body, headers = {}, isFormData = false } = {}) {
  // Fetch current session token (or guest token if in demo mode or unauthenticated)
  let token = null;
  try {
    if (typeof window !== 'undefined' && localStorage.getItem('voicecoach_guest') === 'true') {
      token = 'demo-guest-token';
    } else {
      const { data } = await supabase.auth.getSession();
      token = data?.session?.access_token;
    }
  } catch (_) {}

  // Safe fallback to guarantee no request fails with missing Authorization header
  if (!token) {
    token = 'demo-guest-token';
  }

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    ...headers
  };

  if (!isFormData && body && !(body instanceof FormData)) {
    authHeaders['Content-Type'] = 'application/json';
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: authHeaders,
    body: isFormData ? body : (body && typeof body === 'object' ? JSON.stringify(body) : body)
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = json?.error?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.code = json?.error?.code || 'API_ERROR';
    err.details = json?.error?.details || null;
    throw err;
  }

  return json?.data;
}

export const api = {
  // Profile
  getProfile: () => apiRequest('/profile'),
  updateProfile: (data) => apiRequest('/profile', { method: 'PUT', body: data }),

  // Configuration
  getConfig: () => apiRequest('/config/roles'),

  // Sessions
  createSession: (data) => apiRequest('/sessions', { method: 'POST', body: data }),
  listSessions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/sessions${query ? `?${query}` : ''}`);
  },
  getSession: (id) => apiRequest(`/sessions/${id}`),
  deleteSession: (id) => apiRequest(`/sessions/${id}`, { method: 'DELETE' }),
  startSession: (id) => apiRequest(`/sessions/${id}/start`, { method: 'POST' }),
  retryQuestion: (id, turnId) => apiRequest(`/sessions/${id}/retry-question`, { method: 'POST', body: { turn_id: turnId } }),

  // Turn Evaluations
  submitAudioTurn: (id, formData) => apiRequest(`/sessions/${id}/turns`, {
    method: 'POST',
    body: formData,
    isFormData: true
  }),
  submitTextTurn: (id, data) => apiRequest(`/sessions/${id}/turns/text`, {
    method: 'POST',
    body: data
  }),

  // Reports
  completeSession: (id) => apiRequest(`/sessions/${id}/complete`, { method: 'POST' }),
  getSessionReport: (id) => apiRequest(`/sessions/${id}/report`),

  // TTS
  synthesizeSpeech: (text, language) => apiRequest('/tts', {
    method: 'POST',
    body: { text, language }
  }),

  // Progress
  getProgress: () => apiRequest('/progress'),

  // Privacy & Account
  deleteAccountData: () => apiRequest('/account/data', { method: 'DELETE' })
};

