"use client";

import * as React from "react";

export type NotificationItem = {
  id: string;
  title: string;
  description?: string;
  kind?: "referral" | "unlock" | "system";
  amount?: string;
  timestamp: number;
  read: boolean;
};

type NotificationsContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationItem, "id" | "read" | "timestamp"> & {
    id?: string;
    timestamp?: number;
  }) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
};

const NotificationsContext = React.createContext<NotificationsContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "rwan:notifications";
const MAX_NOTIFICATIONS = 50;

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as NotificationItem[];
      if (Array.isArray(parsed)) {
        setNotifications(parsed);
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = React.useCallback(
    (
      notification: Omit<NotificationItem, "id" | "read" | "timestamp"> & {
        id?: string;
        timestamp?: number;
      }
    ) => {
      const id = notification.id ?? crypto.randomUUID();
      const timestamp = notification.timestamp ?? Date.now();

      setNotifications((current) => {
        if (current.some((item) => item.id === id)) return current;
        const next = [
          {
            id,
            title: notification.title,
            description: notification.description,
            kind: notification.kind,
            amount: notification.amount,
            timestamp,
            read: false,
          },
          ...current,
        ];
        return next.slice(0, MAX_NOTIFICATIONS);
      });
    },
    []
  );

  const markRead = React.useCallback((id: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  }, []);

  const markAllRead = React.useCallback(() => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true }))
    );
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = React.useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markRead,
        markAllRead,
        clearAll,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = React.useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return context;
}
