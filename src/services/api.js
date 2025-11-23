const API_BASE_URL = 'https://githubnasilkullanilmaz.vercel.app/api';

// Helper function to make API calls with fetch
const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store', // Bypass service worker cache
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP Error: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: async (userData) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }
    return data;
  },

  login: async (credentials) => {
    console.log('🔐 Login attempt:', {
      url: `${API_BASE_URL}/auth/login`,
      email: credentials.email,
      hasPassword: !!credentials.password
    });
    
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    console.log('✅ Login successful:', data);
    
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  getCurrentUser: async () => {
    return apiFetch('/auth/me');
  }
};

// Production Records API
export const productionAPI = {
  createRecord: async (recordData) => {
    return apiFetch('/production-records', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  },

  getAllRecords: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/production-records?${queryString}` : '/production-records';
    return apiFetch(endpoint);
  },

  getRecordById: async (id) => {
    return apiFetch(`/production-records/${id}`);
  },

  updateRecord: async (id, recordData) => {
    return apiFetch(`/production-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recordData),
    });
  },

  deleteRecord: async (id) => {
    return apiFetch(`/production-records/${id}`, {
      method: 'DELETE',
    });
  }
};
