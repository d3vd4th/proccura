import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '@/api/auth';
import { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await authAPI.login(email, password);
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token);
      }
      // Store tenant_id from response or user object
      const tenantId = data.tenant_id || data.user.tenant_id;
      if (tenantId) {
        localStorage.setItem('tenant_id', tenantId);
      }
      return data.user;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      console.error('❌ Login failed:', errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('access_token');
    const cachedUser = localStorage.getItem('user_data');

    if (!token) {
      return rejectWithValue('No token found');
    }

    try {
      const data = await authAPI.getCurrentUser();
      console.log('✅ User loaded from API:', data);
      // Cache user data
      localStorage.setItem('user_data', JSON.stringify(data));
      return data;
    } catch (error: any) {
      console.error('❌ Failed to load from API:', error);
      // Fallback: try to load from cached data
      if (cachedUser) {
        try {
          const userData = JSON.parse(cachedUser);
          console.log('⚠️  Using cached user data:', userData);
          return userData;
        } catch (parseError) {
          console.error('❌ Cached user data invalid:', parseError);
        }
      }
      localStorage.clear();
      return rejectWithValue('Failed to load user');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
        // Cache user data
        localStorage.setItem('user_data', JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load user
    builder
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;