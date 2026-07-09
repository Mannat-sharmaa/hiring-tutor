import { create } from 'zustand';
import api from '../services/api';

// Central auth state. The JWT itself lives in an httpOnly cookie (set by the
// backend), so this store only tracks the user object and loading/error
// state for UI purposes — it never touches the token directly.
const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', payload);
      set({ isLoading: false });
      return data; // { userId, message }
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || 'Registration failed' });
      throw err;
    }
  },

  verifyOtp: async ({ userId, otp }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/verify-otp', { userId, otp });
      if (data.token) {
        localStorage.setItem('educonnect_token', data.token);
      }
      set({ user: data.user, isLoading: false, isInitialized: true });
      return data;
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || 'Invalid OTP' });
      throw err;
    }
  },

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.token) {
        localStorage.setItem('educonnect_token', data.token);
      }
      set({ user: data.user, isLoading: false, isInitialized: true });
      return data;
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || 'Login failed' });
      throw err;
    }
  },

  googleLogin: async ({ idToken, role }) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/google-login', { idToken, role });
      if (data.token) {
        localStorage.setItem('educonnect_token', data.token);
      }
      set({ user: data.user, isLoading: false, isInitialized: true });
      return data;
    } catch (err) {
      set({ isLoading: false, error: err.response?.data?.message || 'Google login failed' });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('educonnect_token');
      set({ user: null, isInitialized: true });
    }
  },

  updateUser: (updatedUser) => {
    set({ user: updatedUser });
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, isInitialized: true });
    } catch {
      set({ user: null, isInitialized: true });
    }
  },
}));

export default useAuthStore;
