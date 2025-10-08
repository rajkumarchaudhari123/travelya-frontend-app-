// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiSignup, apiSendOtp, apiVerifyOtp } from '../../services/auth';

type Role = 'RIDER' | 'DRIVER';
type User = { id: string; phone: string; role?: Role };

type AuthState = {
  user?: User;
  token?: string;
  loading: boolean;
  error?: string;
  pendingPhone?: string; // phone awaiting OTP verify
};

const initialState: AuthState = { loading: false };

export const signupThunk = createAsyncThunk(
  'auth/signup',
  async (payload: { name: string; phone: string; email?: string; password?: string }) => {
    const res = await apiSignup(payload);
    await apiSendOtp(res.phone);
    return { phone: res.phone };
  }
);

export const sendOtpThunk = createAsyncThunk('auth/sendOtp', async (phone: string) => {
  await apiSendOtp(phone);
  return { phone };
});

export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async (payload: { phone: string; otp: string }) => {
    const res = await apiVerifyOtp(payload.phone, payload.otp);
    return res; // { token, role, user }
  }
);

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (s) => { s.user = undefined; s.token = undefined; s.pendingPhone = undefined; s.error = undefined; },
    loginAsRider: (s) => { s.user = { id: 'demo', phone: '9999999999', role: 'RIDER' }; },
    loginAsDriver: (s) => { s.user = { id: 'demo', phone: '9999999999', role: 'DRIVER' }; }
  },
  extraReducers: (b) => {
    b.addCase(signupThunk.pending, (s)=>{ s.loading = true; s.error = undefined; });
    b.addCase(signupThunk.fulfilled, (s,a:PayloadAction<{phone:string}>)=>{ s.loading=false; s.pendingPhone=a.payload.phone; });
    b.addCase(signupThunk.rejected, (s,a)=>{ s.loading=false; s.error=a.error.message; });

    b.addCase(sendOtpThunk.pending, (s)=>{ s.loading = true; s.error = undefined; });
    b.addCase(sendOtpThunk.fulfilled, (s,a:PayloadAction<{phone:string}>)=>{ s.loading=false; s.pendingPhone=a.payload.phone; });
    b.addCase(sendOtpThunk.rejected, (s,a)=>{ s.loading=false; s.error=a.error.message; });

    b.addCase(verifyOtpThunk.pending, (s)=>{ s.loading = true; s.error = undefined; });
    b.addCase(verifyOtpThunk.fulfilled, (s,a)=>{ s.loading=false; s.token=a.payload.token; s.user={...a.payload.user, role:a.payload.role}; s.pendingPhone=undefined; });
    b.addCase(verifyOtpThunk.rejected, (s,a)=>{ s.loading=false; s.error=a.error.message; });
  }
});

export const { logout, loginAsDriver, loginAsRider } = slice.actions;
export default slice.reducer;
