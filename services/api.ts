import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiConfig } from '@/config/env';

const TOKEN_KEY = 'megabyte_mobile_token';
const PERMISSIONS_KEY = 'megabyte_user_permissions';
const USER_KEY = 'megabyte_user_info';

type UnauthorizedHandler = () => void;
let onUnauthorizedCallback: UnauthorizedHandler | null = null;

export const setOnUnauthorized = (callback: UnauthorizedHandler) => {
  onUnauthorizedCallback = callback;
};

export const setAuthToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const clearAuthToken = async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, PERMISSIONS_KEY, USER_KEY, 'megabyte-session']);
};

export const saveUserSession = async (token: string, user: any, permissions: string[]) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  await AsyncStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
  await AsyncStorage.setItem('megabyte-session', 'active');
};

export const getStoredPermissions = async (): Promise<string[]> => {
  const json = await AsyncStorage.getItem(PERMISSIONS_KEY);
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
};

async function apiRequest<T = any>(
  endpoint: string,
  options: { method?: string; body?: any; query?: Record<string, any> } = {}
): Promise<{ success: boolean; data?: T; message?: string; summary?: any; meta?: any; [key: string]: any }> {
  try {
    const config = getApiConfig();
    if (!config.isConfigured || !config.baseUrl) {
      console.warn('[API] Configuration error:', config.error);
      return {
        success: false,
        message: config.error || 'API URL is not configured.',
      };
    }

    const token = await getAuthToken();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    let url = `${config.baseUrl}${cleanEndpoint}`;

    console.log(`[API] ${options.method || 'GET'} ${url}`);

    if (options.query) {
      const params = new URLSearchParams();
      Object.entries(options.query).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params.append(key, String(val));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const method = options.method || 'GET';
    console.log(`[API] ${method} ${cleanEndpoint}`);

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (options.body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);
    console.log(`[API] Response ${response.status} ${cleanEndpoint}`);

    if (response.status === 401) {
      if (cleanEndpoint === '/auth/login') {
        let errJson: any = {};
        try { errJson = await response.json(); } catch {}
        return { success: false, message: errJson?.message || 'Invalid username or password.' };
      }

      console.log('[AUTH] Session expired (HTTP 401)');
      await clearAuthToken();
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      return { success: false, message: 'Session expired. Please log in again.' };
    }

    if (response.status === 403) {
      return { success: false, message: 'You do not have permission to access this resource.' };
    }

    let json: any = {};
    try {
      json = await response.json();
    } catch {
      if (!response.ok) {
        return {
          success: false,
          message: `Server returned HTTP ${response.status} status code.`,
        };
      }
    }

    if (!response.ok && (!json || typeof json.success === 'undefined')) {
      return {
        success: false,
        message: json?.message || `Server returned HTTP ${response.status} error.`,
      };
    }

    return json;
  } catch (error: any) {
    console.error(`[API] Request failed ${endpoint}:`, error.message || error);
    return {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
}

// API Services
export const api = {
  login: (username: string, password: string) =>
    apiRequest('/auth/login', { method: 'POST', body: { username, password } }),

  logout: () => apiRequest('/auth/logout', { method: 'POST' }),

  getBootstrap: () => apiRequest('/bootstrap'),

  getDashboard: () => apiRequest('/dashboard'),

  getStatuses: () => apiRequest('/statuses'),

  getOrders: (params: { search?: string; status?: string; mask?: string; page?: number; per_page?: number } = {}) =>
    apiRequest('/orders', { query: params }),

  getOrderDetails: (id: string) => apiRequest(`/orders/${id}`),

  getOrderHistory: (id: string) => apiRequest(`/orders/${id}/history`),

  getOrderNotes: (id: string) => apiRequest(`/orders/${id}/notes`),

  addOrderNote: (id: string, note: string) =>
    apiRequest(`/orders/${id}/notes`, { method: 'POST', body: { note } }),

  updateOrderStatus: (id: string, status: string) =>
    apiRequest(`/orders/${id}/status`, { method: 'PUT', body: { status } }),

  updateQuantities: (id: string, quantities: { launch_qty?: number; final_qty?: number; failed_qty?: number }) =>
    apiRequest(`/orders/${id}/quantities`, { method: 'PUT', body: quantities }),

  updateFilmApplied: (id: string, filmApplied: boolean) =>
    apiRequest(`/orders/${id}/film-applied`, { method: 'PUT', body: { film_applied: filmApplied } }),

  getInventory: (params: { search?: string; status?: string; page?: number; per_page?: number } = {}) =>
    apiRequest('/inventory', { query: params }),

  getInventoryDetails: (id: string) => apiRequest(`/inventory/${id}`),

  adjustStock: (id: string, amount: number) =>
    apiRequest(`/inventory/${id}/stock`, { method: 'POST', body: { amount } }),

  getProfile: () => apiRequest('/profile'),

  updateProfile: (data: { name: string; email: string; mobile?: string }) =>
    apiRequest('/profile', { method: 'PUT', body: data }),

  changePassword: (data: { current_password: string; new_password: string }) =>
    apiRequest('/profile/password', { method: 'PUT', body: data }),
};
