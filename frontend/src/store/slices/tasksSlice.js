import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as taskService from '../../services/taskService';

export const fetchTasks = createAsyncThunk('tasks/fetch', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await taskService.getTasks(params);
    return { items: res.data.data, meta: res.data.meta };
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const fetchTask = createAsyncThunk('tasks/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await taskService.getTask(id);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const createTask = createAsyncThunk('tasks/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await taskService.createTask(payload);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await taskService.updateTask(id, payload);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const removeTask = createAsyncThunk('tasks/remove', async (id, { rejectWithValue }) => {
  try {
    const res = await taskService.deleteTask(id);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

const slice = createSlice({
  name: 'tasks',
  initialState: { list: [], current: null, loading: false, error: null, meta: { total: 0, page: 1, limit: 20, pages: 0 } },
  reducers: {
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items || [];
        state.meta = action.payload.meta || state.meta;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      })

      .addCase(fetchTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      })

      .addCase(createTask.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.list = state.list.map((t) => (t._id === action.payload._id ? action.payload : t));
        if (state.current && state.current._id === action.payload._id) state.current = action.payload;
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t._id !== action.payload._id);
        if (state.current && state.current._id === action.payload._id) state.current = null;
      });
  },
});

export const { clearCurrent } = slice.actions;
export default slice.reducer;
