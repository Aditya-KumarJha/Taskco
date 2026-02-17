import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import taskReducer from './taskSlice';
import notificationReducer from './notificationSlice';
import adminReducer from './adminSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    notifications: notificationReducer,
    admin: adminReducer,
  },
});

export default store;
