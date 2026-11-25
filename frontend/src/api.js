const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'API request failed');
  }
  return res.json();
}

export const api = {
  getState: () => request('/state'),
  simulate: (payload) =>
    request('/simulate', { method: 'POST', body: JSON.stringify(payload) }),
  restore: (resetTimetable = false) =>
    request('/restore', { method: 'POST', body: JSON.stringify({ resetTimetable }) }),
  resetDemo: () => request('/reset-demo', { method: 'POST' }),
  decideProposal: (id, decision) =>
    request(`/proposals/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision })
    }),
  applyApproved: () => request('/proposals/apply', { method: 'POST' }),
  updateTimetableEntry: (id, updates) =>
    request(`/timetable/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
};
