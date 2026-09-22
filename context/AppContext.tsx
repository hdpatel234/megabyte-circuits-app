import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearAuthToken, getStoredPermissions, saveUserSession, setOnUnauthorized } from '@/services/api';
import { MOCK_INVENTORY, MOCK_JOBS, MOCK_NOTIFICATIONS, type InventoryItem, type Job, type JobStatus, type Notification } from '@/data/mock';

type UserProfile = {
  id: string | number;
  name: string;
  email: string;
  username?: string;
  role?: string;
  department?: string;
  employeeCode?: string;
};

type AppContextValue = {
  hydrated: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (perms: string[]) => boolean;
  hasAllPermissions: (perms: string[]) => boolean;
  jobs: Job[];
  inventory: InventoryItem[];
  notifications: Notification[];
  notificationCount: number;
  bootstrapData: any;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateJobStatus: (jobId: string, status: JobStatus) => Promise<boolean>;
  adjustInventory: (itemId: string, amount: number) => Promise<boolean>;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  refreshBootstrap: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [bootstrapData, setBootstrapData] = useState<any>(null);

  const handleUnauthorized = () => {
    setIsAuthenticated(false);
    setUser(null);
    setPermissions([]);
    setJobs([]);
    setInventory([]);
    setNotifications([]);
    setBootstrapData(null);
  };

  useEffect(() => {
    setOnUnauthorized(handleUnauthorized);
  }, []);

  const refreshBootstrap = async () => {
    const res = await api.getBootstrap();
    if (res.success && res.data) {
      if (res.data.user) setUser(res.data.user);
      if (res.data.permissions) {
        setPermissions(res.data.permissions);
        await AsyncStorage.setItem('megabyte_user_permissions', JSON.stringify(res.data.permissions));
      }
      setBootstrapData(res.data);
      if (typeof res.data.notification_count === 'number') {
        setNotificationCount(res.data.notification_count);
      }
    }
  };

  useEffect(() => {
    let active = true;
    const initSession = async () => {
      console.log('[AUTH] Checking session');
      try {
        const token = await AsyncStorage.getItem('megabyte_mobile_token');
        const storedUser = await AsyncStorage.getItem('megabyte_user_info');
        const perms = await getStoredPermissions();

        if (active) {
          if (token) {
            console.log('[AUTH] Session found in local storage, validating...');
            setPermissions(perms);
            if (storedUser) {
              try { setUser(JSON.parse(storedUser)); } catch {}
            }
            const res = await api.getBootstrap();
            if (res.success && res.data) {
              console.log('[AUTH] Token validated successfully with backend');
              setIsAuthenticated(true);
              if (res.data.user) setUser(res.data.user);
              if (res.data.permissions) {
                setPermissions(res.data.permissions);
                await AsyncStorage.setItem('megabyte_user_permissions', JSON.stringify(res.data.permissions));
              }
              setBootstrapData(res.data);
              if (typeof res.data.notification_count === 'number') {
                setNotificationCount(res.data.notification_count);
              }
            } else if (!res.success && res.message && (res.message.includes('Session expired') || res.message.includes('Unauthenticated'))) {
              console.log('[AUTH] Token rejected by backend. Clearing auth session.');
              await clearAuthToken();
              setIsAuthenticated(false);
              setUser(null);
              setPermissions([]);
            } else {
              console.log('[AUTH] Backend offline or unreachable. Using stored session info.');
              setIsAuthenticated(true);
            }
          } else {
            console.log('[AUTH] No session found');
            setIsAuthenticated(false);
          }
          setHydrated(true);
        }
      } catch (err) {
        if (active) {
          console.log('[AUTH] Error checking session:', err);
          setIsAuthenticated(false);
          setHydrated(true);
        }
      }
    };

    initSession();

    return () => {
      active = false;
    };
  }, []);

  const hasPermission = (permission: string) => {
    return true;
  };

  const hasAnyPermission = (perms: string[]) => {
    return true;
  };

  const hasAllPermissions = (perms: string[]) => {
    return true;
  };

  const login = async (username: string, password: string) => {
    console.log('[AUTH] Attempting login');
    const res = await api.login(username, password);
    if (res.success && res.data) {
      console.log('[AUTH] Login successful');
      const { token, user: userData, permissions: userPerms } = res.data;
      const validPerms = Array.isArray(userPerms) ? userPerms : [];
      await saveUserSession(token, userData, validPerms);
      setUser(userData);
      setPermissions(validPerms);
      setIsAuthenticated(true);
      await refreshBootstrap();
      return { success: true };
    } else {
      console.log('[AUTH] Login failed:', res.message);
      return { success: false, message: res.message || 'Invalid username or password' };
    }
  };

  const logout = async () => {
    console.log('[AUTH] Logging out: calling API and clearing tokens');
    try {
      await api.logout();
    } catch (e) {
      console.warn('[AUTH] Backend logout API call error:', e);
    }
    await clearAuthToken();
    setIsAuthenticated(false);
    setUser(null);
    setPermissions([]);
    setJobs([]);
    setInventory([]);
    setNotifications([]);
    setBootstrapData(null);
  };

  const updateJobStatus = async (jobId: string, status: JobStatus): Promise<boolean> => {
    setJobs((current) =>
      current.map((job) => (job.id === jobId ? { ...job, status, lastUpdate: 'Just now' } : job))
    );
    const res = await api.updateOrderStatus(jobId, status);
    return res.success;
  };

  const adjustInventory = async (itemId: string, amount: number): Promise<boolean> => {
    setInventory((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + amount), lastUpdated: 'Just now' } : item
      )
    );
    const res = await api.adjustStock(itemId, amount);
    return res.success;
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((current) =>
      current.map((notification) => (notification.id === notificationId ? { ...notification, unread: false } : notification))
    );
    if (typeof (api as any).markNotificationRead === 'function') {
      (api as any).markNotificationRead(notificationId);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, unread: false }))
    );
  };

  const value = useMemo(
    () => ({
      hydrated,
      isAuthenticated,
      user,
      permissions,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      jobs,
      inventory,
      notifications,
      notificationCount,
      bootstrapData,
      login,
      logout,
      updateJobStatus,
      adjustInventory,
      markNotificationRead,
      markAllNotificationsRead,
      refreshBootstrap,
    }),
    [hydrated, isAuthenticated, user, permissions, jobs, inventory, notifications, notificationCount, bootstrapData]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used within AppProvider');
  return value;
}