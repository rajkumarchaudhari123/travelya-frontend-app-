// src/auth/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../lib/firebase';
type Ctx = { user: User | null; loading: boolean; signOut: () => Promise<void> };
const AuthContext = createContext<Ctx>({ user: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const sub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return () => sub();
  }, []);
  return <AuthContext.Provider value={{ user, loading, signOut: () => auth.signOut() }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
