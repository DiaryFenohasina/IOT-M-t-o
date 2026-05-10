import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { getCurrentUser, loginUser, logoutUser, registerUser } from '@/services/authService';
import type { User } from '@/types/auth';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: async (email, password) => {
        const loggedUser = await loginUser(email, password);
        setUser(loggedUser);
      },
      register: async (name, email, password) => {
        const registeredUser = await registerUser(name, email, password);
        setUser(registeredUser);
      },
      logout: async () => {
        await logoutUser();
        setUser(null);
      },
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth doit etre utilise dans AuthProvider.');
  }

  return context;
};
