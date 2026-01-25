import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { loginUser } from '@/api/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: { name: string; username?: string; role: string } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface LoginPayload {
  token: string;
  username?: string;
  [key: string]: unknown;
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem('token'),
  user: null, // We might decode token or fetch user profile later
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ({ email, password }: any, { rejectWithValue }) => {
    try {
      const data = await loginUser(email, password);
      return data as unknown as LoginPayload; // Expected { token: string, user: ... }
    } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginPayload>) => {
        state.loading = false;
        state.isAuthenticated = true;
        // Adjust based on actual backend response structure
        // If backend returns { token: "..." }, we store it.
        state.token = action.payload.token;
        state.user = {
            name: action.payload.username || 'Admin',
            username: action.payload.username || 'Admin',
            role: 'admin'
        };
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
