const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

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
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

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
    if (!text || text.trim() === '') {
      return {} as T;
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse response as JSON:', text, e);
      return text as unknown as T;
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
