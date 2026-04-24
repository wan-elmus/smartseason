const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '';
  }
  return process.env.BACKEND_URL || '';
};

const API_BASE = getBaseUrl();

export const ROUTES = {
  // Auth
  LOGIN: `${API_BASE}/auth/login`,
  REGISTER: `${API_BASE}/auth/register`,
  REFRESH_TOKEN: `${API_BASE}/auth/refresh`,
  ME: `${API_BASE}/auth/me`,
  CHANGE_PASSWORD: `${API_BASE}/auth/change-password`,
  MY_UPDATES: `${API_BASE}/updates/my`,
  MY_FIELDS: `${API_BASE}/fields/agent/assigned`,
  
  // Users
  USERS_AGENTS: `${API_BASE}/users/agents`,
  USERS_ALL: `${API_BASE}/users`,
  
  // Fields
  FIELDS: `${API_BASE}/fields`,
  FIELD_DETAIL: (id) => `${API_BASE}/fields/${id}`,
  ASSIGN_FIELD: (id) => `${API_BASE}/fields/${id}/assign`,
  AGENT_FIELDS: `${API_BASE}/fields/agent/assigned`,
  
  // Updates
  CREATE_UPDATE: (fieldId) => `${API_BASE}/updates/fields/${fieldId}`,
  FIELD_UPDATES: (fieldId) => `${API_BASE}/updates/fields/${fieldId}`,
  
  // Dashboard
  ADMIN_DASHBOARD: `${API_BASE}/dashboard/admin`,
  AGENT_DASHBOARD: `${API_BASE}/dashboard/agent`,
  
  // AI
  AI_ALERT: (updateId) => `${API_BASE}/ai/alerts/${updateId}`,
  SUGGEST_STAGE: (fieldId) => `${API_BASE}/ai/suggest-stage/${fieldId}`,

  UPLOAD_IMAGE: `${API_BASE}/upload/image`,
  
  // Profile
  UPDATE_PROFILE: `${API_BASE}/users/profile`,

  // Trends
  FIELD_ACTIVITY_TREND: `${API_BASE}/trends/field-activity`,
  FIELD_GROWTH_TREND: `${API_BASE}/trends/field-growth`,
  STATUS_DISTRIBUTION: `${API_BASE}/trends/status-distribution-over-time`,
  
  // General
  HEALTH: `${API_BASE}/health`,
};