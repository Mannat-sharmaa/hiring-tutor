import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';
import useAuthStore from '../store/authStore';

let socket = null;

export function useNotifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch existing notifications from REST
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Connect socket and listen for real-time notifications
  useEffect(() => {
    if (!user) return;

    // Get a JWT token from cookie by calling /auth/token endpoint
    // We use the existing session cookie auth, so we pass a quick handshake
    const connectSocket = async () => {
      try {
        const { data } = await api.get('/auth/socket-token');
        const token = data.token;

        if (socket) {
          socket.disconnect();
          socket = null;
        }

        const socketUrl = window.location.hostname === 'localhost' ? 'http://127.0.0.1:5001' : '/';
        socket = io(socketUrl, {
          withCredentials: true,
          auth: { token },
          transports: ['websocket', 'polling'],
        });

        socket.on('notification:new', (notif) => {
          setNotifications((prev) => [notif, ...prev]);
          setUnreadCount((c) => c + 1);

          // Browser toast notification (if permission granted)
          if (Notification.permission === 'granted') {
            new Notification(notif.title, { body: notif.body, icon: '/favicon.ico' });
          }
        });
      } catch {
        /* silent — socket is nice-to-have */
      }
    };

    connectSocket();

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const markOneRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* silent */ }
  };

  return { notifications, unreadCount, loading, markAllRead, markOneRead, refetch: fetchNotifications };
}
