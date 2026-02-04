import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async () => {
    const response = await api.get('/api/v1/notifications');
    return response.data;
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId) => {
    const response = await api.patch(`/api/v1/notifications/${notificationId}/read`);
    return response.data;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async () => {
    const response = await api.patch('/api/v1/notifications/read-all');
    return response.data;
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId) => {
    await api.delete(`/api/v1/notifications/${notificationId}`);
    return notificationId;
  }
);

const initialState = {
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        const notificationsData = action.payload.data?.notifications || action.payload.notifications || action.payload;
        state.notifications = Array.isArray(notificationsData) ? notificationsData : [];
        state.unreadCount = state.notifications.filter(n => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = action.payload.data?.notification || action.payload.notification || action.payload;
        const index = state.notifications.findIndex(n => n._id === notification._id);
        
        if (index !== -1) {
          if (!state.notifications[index].read) {
            state.unreadCount--;
          }
          state.notifications[index] = notification;
        }
      })
      
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, read: true }));
        state.unreadCount = 0;
      })
      
      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        
        if (notification && !notification.read) {
          state.unreadCount--;
        }
        
        state.notifications = state.notifications.filter(n => n._id !== notificationId);
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
