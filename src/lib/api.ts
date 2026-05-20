import {
  demoFacilities, demoAssets, demoMaintenance, demoBookings
} from './demoData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// In-memory store for demo mutations (add/delete during a session)
let _facilities = [...demoFacilities];
let _assets = [...demoAssets];
let _maintenance = [...demoMaintenance];
let _bookings = [...demoBookings];

function getDemoResponse(endpoint: string, method: string, body?: any): any {
  // GET /facilities
  if (method === 'GET' && endpoint === '/facilities') return [..._facilities];
  // POST /facilities
  if (method === 'POST' && endpoint === '/facilities') {
    const item = { ...body, equipment: body.equipment || [] };
    _facilities = [item, ..._facilities];
    return item;
  }
  // DELETE /facilities/:id
  if (method === 'DELETE' && endpoint.startsWith('/facilities/')) {
    const id = endpoint.split('/').pop();
    _facilities = _facilities.filter(f => f.id !== id);
    return {};
  }

  // GET /assets
  if (method === 'GET' && endpoint === '/assets') return [..._assets];
  // POST /assets
  if (method === 'POST' && endpoint === '/assets') {
    _assets = [body, ..._assets];
    return body;
  }
  // DELETE /assets/:id
  if (method === 'DELETE' && endpoint.startsWith('/assets/')) {
    const id = endpoint.split('/').pop();
    _assets = _assets.filter(a => a.id !== id);
    return {};
  }

  // GET /maintenance
  if (method === 'GET' && endpoint === '/maintenance') return [..._maintenance];
  // POST /maintenance
  if (method === 'POST' && endpoint === '/maintenance') {
    _maintenance = [body, ..._maintenance];
    return body;
  }
  // PATCH /maintenance/:id
  if (method === 'PATCH' && endpoint.startsWith('/maintenance/')) {
    const id = endpoint.split('/')[2];
    _maintenance = _maintenance.map(m => m.id === id ? { ...m, ...body } : m);
    return _maintenance.find(m => m.id === id);
  }
  // DELETE /maintenance/:id
  if (method === 'DELETE' && endpoint.startsWith('/maintenance/')) {
    const id = endpoint.split('/').pop();
    _maintenance = _maintenance.filter(m => m.id !== id);
    return {};
  }

  // GET /bookings
  if (method === 'GET' && endpoint === '/bookings') return [..._bookings];
  // POST /bookings
  if (method === 'POST' && endpoint === '/bookings') {
    _bookings = [body, ..._bookings];
    return body;
  }
  // PATCH /bookings/:id
  if (method === 'PATCH' && endpoint.startsWith('/bookings/')) {
    const id = endpoint.split('/')[2];
    _bookings = _bookings.map(b => b.id === id ? { ...b, ...body } : b);
    return _bookings.find(b => b.id === id);
  }
  // DELETE /bookings/:id
  if (method === 'DELETE' && endpoint.startsWith('/bookings/')) {
    const id = endpoint.split('/').pop();
    _bookings = _bookings.filter(b => b.id !== id);
    return {};
  }

  // Dashboard stats
  if (method === 'GET' && endpoint === '/dashboard/stats') {
    return {
      availableClassrooms: _facilities.filter(f => f.status === 'Available').length,
      activeMaintenance: _maintenance.filter(m => m.status === 'In Progress' || m.status === 'Pending').length,
      totalAssets: _assets.length,
      criticalIssues: _maintenance.filter(m => m.priority === 'High' && m.status !== 'Completed').length,
    };
  }

  return null;
}

export const api = {
  getHeaders() {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true',
    };
    const token = localStorage.getItem('pvpsit_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body as string) : undefined;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });
      clearTimeout(timeout);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('pvpsit_auth_token');
          localStorage.removeItem('pvpsit_auth_user');
          window.location.href = '/login';
          return {} as T;
        }
        const errText = await response.text().catch(() => '');
        let errMsg = `HTTP error! status: ${response.status}`;
        try {
          if (errText) {
            const errData = JSON.parse(errText);
            errMsg = errData.message || errMsg;
          }
        } catch (e) {}
        throw new Error(errMsg);
      }

      const text = await response.text();
      if (!text || text.trim() === '') return {} as T;

      try {
        return JSON.parse(text);
      } catch (e) {
        return text as unknown as T;
      }
    } catch (_err) {
      // Backend unavailable — use demo data fallback
      console.warn(`[Demo Mode] Backend unavailable, using demo data for ${method} ${endpoint}`);
      const demoResult = getDemoResponse(endpoint, method, body);
      if (demoResult !== null) return demoResult as T;
      // For auth endpoints, re-throw so auth fallback handles it
      throw _err;
    }
  },

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  },

  post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  patch<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  },
};
