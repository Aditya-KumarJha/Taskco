import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ status, priority, sort, search } = {}) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    
    // Parse sort parameter - handle formats like '-createdAt' or 'createdAt'
    if (sort) {
      let sortField = sort;
      let sortOrder = 'desc';
      
      if (sort.startsWith('-')) {
        sortField = sort.substring(1);
        sortOrder = 'desc';
      } else if (sort.startsWith('+')) {
        sortField = sort.substring(1);
        sortOrder = 'asc';
      } else {
        sortField = sort;
        sortOrder = 'desc';
      }
      
      params.append('sort', sortField);
      params.append('order', sortOrder);
    }
    
    if (search) params.append('search', search);
    
    const response = await api.get(`/api/v1/tasks?${params.toString()}`);
    return response.data?.data || response.data;
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId) => {
    const response = await api.get(`/api/v1/tasks/${taskId}`);
    return response.data;
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData) => {
    const formData = new FormData();
    
    Object.keys(taskData).forEach(key => {
      if (taskData[key] !== null && taskData[key] !== undefined) {
        if (key === 'image' && taskData[key] instanceof File) {
          formData.append('image', taskData[key]);
        } else {
          formData.append(key, taskData[key]);
        }
      }
    });
    
    const response = await api.post('/api/v1/tasks', formData);
    return response.data;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }) => {
    const formData = new FormData();
    
    Object.keys(taskData).forEach(key => {
      if (taskData[key] !== null && taskData[key] !== undefined) {
        if (key === 'image' && taskData[key] instanceof File) {
          formData.append('image', taskData[key]);
        } else {
          formData.append(key, taskData[key]);
        }
      }
    });
    
    const response = await api.patch(`/api/v1/tasks/${taskId}`, formData);
    return response.data;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId) => {
    await api.delete(`/api/v1/tasks/${taskId}`);
    return taskId;
  }
);

const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  filters: {
    status: null,
    priority: null,
    sort: '-createdAt',
    search: '',
  },
  stats: {
    total: 0,
    todo: 0,
    in_progress: 0,
    done: 0,
  },
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns { success: true, data: { tasks: [...], pagination: {...} } }
        const responseData = action.payload;
        const tasksData = responseData?.tasks || [];
        state.tasks = Array.isArray(tasksData) ? tasksData : [];

        // Calculate stats safely
        const tasks = state.tasks || [];
        state.stats = {
          total: tasks.length,
          todo: tasks.filter((t) => t.status === 'todo').length,
          in_progress: tasks.filter((t) => t.status === 'in_progress').length,
          done: tasks.filter((t) => t.status === 'done').length,
        };
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch task by id
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = (action.payload && (action.payload.data?.task || action.payload.task)) || action.payload || null;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Create task
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        const newTask = (action.payload && (action.payload.data?.task || action.payload.task)) || action.payload;
        if (newTask && typeof newTask === 'object' && newTask._id) {
          state.tasks.unshift(newTask);
          state.stats.total = (state.stats.total || 0) + 1;
          const s = newTask.status || 'todo';
          state.stats[s] = (state.stats[s] || 0) + 1;
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = (action.payload && (action.payload.data?.task || action.payload.task)) || action.payload;
        if (!updatedTask || !updatedTask._id) return;
        const index = state.tasks.findIndex((t) => t._id === updatedTask._id);
        
        if (index !== -1) {
          const oldStatus = state.tasks[index].status;
          state.tasks[index] = updatedTask;
          
          // Update stats if status changed
          if (oldStatus !== updatedTask.status) {
            state.stats[oldStatus]--;
            state.stats[updatedTask.status]++;
          }
        }
        
        if (state.currentTask?._id === updatedTask._id) {
          state.currentTask = updatedTask;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        const taskId = action.payload;
        if (!taskId) return;
        const task = state.tasks.find((t) => t._id === taskId);

        if (task) {
          const s = task.status || 'todo';
          state.stats[s] = Math.max(0, (state.stats[s] || 0) - 1);
          state.stats.total = Math.max(0, (state.stats.total || 1) - 1);
        }

        state.tasks = (state.tasks || []).filter((t) => t._id !== taskId);

        if (state.currentTask?._id === taskId) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { setFilters, clearFilters, clearCurrentTask } = taskSlice.actions;
export default taskSlice.reducer;
