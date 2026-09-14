import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { MOCK_INVENTORY, MOCK_JOBS, MOCK_NOTIFICATIONS, type InventoryItem, type Job, type JobStatus, type Notification } from '@/data/mock';

type AppContextValue = {
  hydrated: boolean;
  isAuthenticated: boolean;
  jobs: Job[];
  inventory: InventoryItem[];
  notifications: Notification[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  adjustInventory: (itemId: string, amount: number) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem('megabyte-session').then((value) => {
      if (active) {
        setIsAuthenticated(value === 'active');
        setHydrated(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const login = async (username: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const accepted = username.trim().length > 2 && password.trim().length >= 4;
    if (accepted) {
      await AsyncStorage.setItem('megabyte-session', 'active');
      setIsAuthenticated(true);
    }
    return accepted;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('megabyte-session');
    setIsAuthenticated(false);
  };

  const updateJobStatus = (jobId: string, status: JobStatus) => {
    setJobs((current) => current.map((job) => job.id === jobId ? { ...job, status, lastUpdate: 'Just now' } : job));
  };

  const adjustInventory = (itemId: string, amount: number) => {
    setInventory((current) => current.map((item) => item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + amount), lastUpdated: 'Just now' } : item));
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((current) => current.map((notification) => notification.id === notificationId ? { ...notification, unread: false } : notification));
  };

  const markAllNotificationsRead = () => {
    setNotifications((current) => current.map((notification) => ({ ...notification, unread: false })));
  };

  const value = useMemo(() => ({
    hydrated, isAuthenticated, jobs, inventory, notifications, login, logout,
    updateJobStatus, adjustInventory, markNotificationRead, markAllNotificationsRead,
  }), [hydrated, isAuthenticated, jobs, inventory, notifications]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used within AppProvider');
  return value;
}