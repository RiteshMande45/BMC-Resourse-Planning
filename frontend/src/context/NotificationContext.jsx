import React, { createContext, useContext, useState, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const NotificationContext = createContext({
  showNotification: () => {},
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
});

export function NotificationProvider({ children }) {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
  const [notifications, setNotifications] = useState([
    { id: 'notif-1', title: 'New Resource Request', message: 'Durgadas Barhate submitted a request for BMC Control-M.', time: '10m ago', isRead: false },
    { id: 'notif-2', title: 'Timesheet Alert', message: 'K. Desai logged 46 hours (> 110% capacity).', time: '1h ago', isRead: false },
    { id: 'notif-3', title: 'Task Blocked', message: 'Test Employee reported blocker on Connect HR portal.', time: '2d ago', isRead: false },
  ]);

  const showNotification = useCallback((message, severity = 'info') => {
    setToast({ open: true, message, severity });
  }, []);

  const handleClose = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{ showNotification, notifications, unreadCount, markAllRead }}
    >
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={toast.severity} sx={{ width: '100%', borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}

