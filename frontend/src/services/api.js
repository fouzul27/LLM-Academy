// LLM Academy — API Service Layer
// Handles all communication with the FastAPI backend with dual-layer auth support:
// 1. Same-origin HttpOnly cookies (via Vite dev proxy)
// 2. Authorization Bearer header fallback (for cross-origin requests)

const API_BASE = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : ''; // Relative path uses Vite proxy forwarding to 127.0.0.1:8000

const TOKEN_KEY = 'llm_academy_token';

/**
 * Get the stored session token from localStorage or sessionStorage
 */
export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Save the session token to storage
 */
export function setStoredToken(token, remember = true) {
  try {
    if (!token) {
      clearStoredToken();
      return;
    }
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  } catch (e) {
    console.warn('Could not save session token to storage:', e);
  }
}

/**
 * Remove session token from all storage
 */
export function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage clear errors
  }
}

/**
 * Helper to make authenticated requests with JSON payload and error parsing
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...(options.headers || {}),
  };

  // Add Bearer token header if available
  const token = getStoredToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.detail = errorData.detail;
    throw error;
  }

  return response.json();
}

/**
 * Register a new user
 * @param {{ full_name, email, password, learning_level, learning_goal }} data
 * @returns {Promise<{ user: object, session_token: string, message: string }>}
 */
export async function signup(data) {
  const res = await request('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (res.session_token) {
    setStoredToken(res.session_token, true);
  }

  return res;
}

/**
 * Log in an existing user
 * @param {{ email, password, remember_me }} data
 * @returns {Promise<{ user: object, session_token: string, message: string }>}
 */
export async function login(data) {
  const res = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (res.session_token) {
    setStoredToken(res.session_token, data.remember_me !== false);
  }

  return res;
}

/**
 * Log out the current user session
 * @returns {Promise<{ message: string }>}
 */
export async function logout() {
  try {
    return await request('/api/auth/logout', { method: 'POST' });
  } finally {
    clearStoredToken();
  }
}

/**
 * Fetch current authenticated user session
 * @returns {Promise<{ user: object } | null>}
 */
export async function getCurrentUser() {
  try {
    return await request('/api/auth/me', { method: 'GET' });
  } catch (err) {
    if (err.status === 401) {
      clearStoredToken();
      return null;
    }
    return null;
  }
}

/**
 * Update user preferences
 * @param {object} preferences
 * @returns {Promise<{ user: object }>}
 */
export async function updatePreferences(preferences) {
  return request('/api/auth/preferences', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
}

/**
 * Send a message to the AI Tutor via the backend
 * @param {string} message - The user's message
 * @param {string} level - The user's learning level
 * @returns {Promise<{reply: string}>}
 */
export async function sendChatMessage(message, level = 'beginner') {
  return request('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, level }),
  });
}

/**
 * Fetch all AI build projects for the current user
 * @returns {Promise<{ projects: Array }>}
 */
export async function getProjects() {
  return request('/api/projects', { method: 'GET' });
}

/**
 * Initialize a new AI build project with tailored 10-stage roadmap
 * @param {object} projectData
 * @returns {Promise<{ project: object, message: string }>}
 */
export async function createProject(projectData) {
  return request('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
  });
}

/**
 * Fetch full project details (roadmap, tasks, files, memory)
 * @param {number} projectId
 * @returns {Promise<{ project: object }>}
 */
export async function getProject(projectId) {
  return request(`/api/projects/${projectId}`, { method: 'GET' });
}

/**
 * Update task status and advance stage
 * @param {number} projectId
 * @param {number} taskId
 * @param {object} updateData
 * @returns {Promise<{ project: object, message: string }>}
 */
export async function updateProjectTask(projectId, taskId, updateData) {
  return request(`/api/projects/${projectId}/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
}

/**
 * Send message to context-infused AI Mentor
 * @param {number} projectId
 * @param {string} message
 * @returns {Promise<{ reply: string }>}
 */
export async function sendProjectChat(projectId, message) {
  return request(`/api/projects/${projectId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
}

/**
 * Safely execute and verify Python code snippet
 * @param {number} projectId
 * @param {string} code
 * @returns {Promise<{ success: boolean, stdout: string, stderr: string, duration_seconds: number }>}
 */
export async function verifyProjectCode(projectId, code) {
  return request(`/api/projects/${projectId}/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
}

/**
 * Check if the backend is healthy
 * @returns {Promise<{status: string}>}
 */
export async function checkHealth() {
  const url = `${API_BASE}/health`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Backend not available');
  return response.json();
}

export default {
  signup,
  login,
  logout,
  getCurrentUser,
  updatePreferences,
  sendChatMessage,
  getProjects,
  createProject,
  getProject,
  updateProjectTask,
  sendProjectChat,
  verifyProjectCode,
  checkHealth,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
};
