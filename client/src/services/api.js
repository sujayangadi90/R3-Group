const API_BASE = '/api';

const getHeaders = (isAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (isAuth) {
    const token = localStorage.getItem('r3_admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

export const api = {
  // Auth
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  async verifyAuth() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(true),
    });
    return res.json();
  },

  // Users Management (Admin Users)
  async getUsers() {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getHeaders(true),
    });
    return res.json();
  },

  async createUser(data) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateUser(id, data) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteUser(id) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },

  // File Upload
  async uploadPhotos(files) {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }
    const token = localStorage.getItem('r3_admin_token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/upload/multiple`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  },

  // Properties
  async getProperties(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        query.append(key, val);
      }
    });
    const res = await fetch(`${API_BASE}/properties?${query.toString()}`);
    return res.json();
  },

  async getProperty(idOrSlug) {
    const res = await fetch(`${API_BASE}/properties/${idOrSlug}`);
    return res.json();
  },

  async createProperty(data) {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateProperty(id, data) {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async toggleFeaturedProperty(id) {
    const res = await fetch(`${API_BASE}/properties/${id}/toggle-featured`, {
      method: 'PATCH',
      headers: getHeaders(true),
    });
    return res.json();
  },

  async deleteProperty(id) {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },

  // Enquiries
  async submitEnquiry(data) {
    const res = await fetch(`${API_BASE}/enquiries`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getEnquiries(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await fetch(`${API_BASE}/enquiries?${query.toString()}`, {
      headers: getHeaders(true),
    });
    return res.json();
  },

  async updateEnquiry(id, data) {
    const res = await fetch(`${API_BASE}/enquiries/${id}`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteEnquiry(id) {
    const res = await fetch(`${API_BASE}/enquiries/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },

  // Dashboard Stats
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/stats/dashboard`, {
      headers: getHeaders(true),
    });
    return res.json();
  },

  // Location Master (Cities & Localities)
  async getLocations(all = false) {
    const res = await fetch(`${API_BASE}/locations${all ? '?all=true' : ''}`);
    return res.json();
  },

  async createCity(data) {
    const res = await fetch(`${API_BASE}/locations`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateCity(id, data) {
    const res = await fetch(`${API_BASE}/locations/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteCity(id) {
    const res = await fetch(`${API_BASE}/locations/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },

  async addLocality(cityId, data) {
    const res = await fetch(`${API_BASE}/locations/${cityId}/localities`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateLocality(cityId, localityId, data) {
    const res = await fetch(`${API_BASE}/locations/${cityId}/localities/${localityId}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteLocality(cityId, localityId) {
    const res = await fetch(`${API_BASE}/locations/${cityId}/localities/${localityId}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },

  // Lead Sources Master
  async getLeadSources(all = false) {
    const res = await fetch(`${API_BASE}/lead-sources${all ? '?all=true' : ''}`);
    return res.json();
  },

  async createLeadSource(data) {
    const res = await fetch(`${API_BASE}/lead-sources`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateLeadSource(id, data) {
    const res = await fetch(`${API_BASE}/lead-sources/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteLeadSource(id) {
    const res = await fetch(`${API_BASE}/lead-sources/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },

  // Sell Property Requests (Independent from Enquiries / Leads)
  async submitSellRequest(data) {
    const res = await fetch(`${API_BASE}/sell-requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getSellRequests(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await fetch(`${API_BASE}/sell-requests?${query.toString()}`, {
      headers: getHeaders(true),
    });
    return res.json();
  },

  async updateSellRequest(id, data) {
    const res = await fetch(`${API_BASE}/sell-requests/${id}`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteSellRequest(id) {
    const res = await fetch(`${API_BASE}/sell-requests/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });
    return res.json();
  },
};
