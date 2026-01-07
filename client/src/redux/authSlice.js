import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../utils/api";

export const login = createAsyncThunk(
  "auth/login", 
  async (data, { rejectWithValue }) => {
    try {
      const res = await API.post("/auth/login", data);
      localStorage.setItem("token", res.data.token);
      return res.data.user;
    } catch (error) {
      // Extract error message from response
      const message = error.response?.data?.message || error.message || "Login failed";
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  "auth/register", 
  async (data, { rejectWithValue }) => {
    try {
      const res = await API.post("/auth/register", data);
      return res.data.user;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Registration failed";
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: { 
    user: null,
    loading: false,
    error: null
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      state.user = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;