import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

const initialState = {
  stats: null,
  users: [],
  tasks: [],
  loading: false,
  error: null,
  pagination: {
    users: { page: 1, limit: 20, total: 0, pages: 0 },
    tasks: { page: 1, limit: 20, total: 0, pages: 0 },
  },
};

// Fetch admin stats
export const fetchAdminStats = createAsyncThunk('admin/fetchStats', async () => {
  const res = await api.get('/api/v1/admin/stats');
  return res.data.data;
});

// Fetch all users
export const fetchAllUsers = createAsyncThunk('admin/fetchUsers', async (params = {}) => {
  const { page = 1, limit = 20, role, isVerified, provider, search } = params;
  const queryParams = new URLSearchParams();
  queryParams.append('page', page);
  queryParams.append('limit', limit);
  if (role) queryParams.append('role', role);
  if (isVerified !== undefined) queryParams.append('isVerified', isVerified);
  if (provider) queryParams.append('provider', provider);
  if (search) queryParams.append('search', search);
  
  const res = await api.get(`/api/v1/admin/users?${queryParams.toString()}`);
  return res.data.data;
});

// Fetch all tasks
export const fetchAllTasks = createAsyncThunk('admin/fetchTasks', async (params = {}) => {
  const { page = 1, limit = 20, status, priority, userId, search } = params;
  const queryParams = new URLSearchParams();
  queryParams.append('page', page);
  queryParams.append('limit', limit);
  if (status) queryParams.append('status', status);
  if (priority) queryParams.append('priority', priority);
  if (userId) queryParams.append('userId', userId);
  if (search) queryParams.append('search', search);
  
  const res = await api.get(`/api/v1/admin/tasks?${queryParams.toString()}`);
  return res.data.data;
});

// Delete user
export const deleteUser = createAsyncThunk('admin/deleteUser', async (userId) => {
  await api.delete(`/api/v1/admin/users/${userId}`);
  return userId;
});

// Delete task
export const deleteTask = createAsyncThunk('admin/deleteTask', async (taskId) => {
  await api.delete(`/api/v1/admin/tasks/${taskId}`);
  return taskId;
});

// Update user role
export const updateUserRole = createAsyncThunk('admin/updateUserRole', async ({ userId, role }) => {
  const res = await api.patch(`/api/v1/admin/users/${userId}/role`, { role });
  return { userId, role };
});

// Toggle user verification
export const toggleUserVerification = createAsyncThunk('admin/toggleUserVerification', async (userId) => {
  const res = await api.patch(`/api/v1/admin/users/${userId}/verification`);
  return res.data.data;
});

// Bulk delete users
export const bulkDeleteUsers = createAsyncThunk('admin/bulkDeleteUsers', async (userIds) => {
  const res = await api.post('/api/v1/admin/users/bulk-delete', { userIds });
  return userIds;
});

// Bulk delete tasks
export const bulkDeleteTasks = createAsyncThunk('admin/bulkDeleteTasks', async (taskIds) => {
  const res = await api.post('/api/v1/admin/tasks/bulk-delete', { taskIds });
  return taskIds;
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination.users = action.payload.pagination;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch tasks
      .addCase(fetchAllTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.pagination.tasks = action.payload.pagination;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user._id !== action.payload);
      })
      
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
      })
      
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const user = state.users.find(u => u._id === action.payload.userId);
        if (user) {
          user.role = action.payload.role;
        }
      })
      
      .addCase(toggleUserVerification.fulfilled, (state, action) => {
        const user = state.users.find(u => u._id === action.payload.userId);
        if (user) {
          user.isVerified = action.payload.isVerified;
        }
      })
      
      .addCase(bulkDeleteUsers.fulfilled, (state, action) => {
        state.users = state.users.filter(user => !action.payload.includes(user._id));
      })
      
      .addCase(bulkDeleteTasks.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => !action.payload.includes(task._id));
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
