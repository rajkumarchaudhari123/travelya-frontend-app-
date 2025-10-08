export async function apiSignup(payload: { name: string; phone: string; email?: string; password?: string }) {
  // simulate api delay + unique user id
  await new Promise(r => setTimeout(r, 600));
  return { userId: 'u_' + Math.random().toString(36).slice(2), phone: payload.phone };
}

export async function apiSendOtp(phone: string) {
  await new Promise(r => setTimeout(r, 400));
  // return opaque request id in real APIs; here none needed
  return { sent: true };
}

export async function apiVerifyOtp(phone: string, otp: string) {
  await new Promise(r => setTimeout(r, 400));
  if (otp !== '1234' && otp !== '000000' && otp.length < 4) {
    // simple reject rule
    throw new Error('Invalid OTP');
  }
  // return token + role from server in real life
  return { token: 'demo.jwt.token', role: 'RIDER' as const, user: { id: 'demo', phone } };
}
