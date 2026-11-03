import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, setToken, clearToken, isTokenExpired, decodeJwt } from '../utils/token';
import { login as apiLogin, logout as apiLogout } from '../api/services/authService';
import { ROLES, ROLE_HOME } from '../constants/roles';

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  switchMockRole: () => {},
});

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => getToken());
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from token on app load
  useEffect(() => {
    try {
      const storedToken = getToken();
      if (storedToken && !isTokenExpired(storedToken)) {
        const payload = decodeJwt(storedToken);
        if (payload) {
          setUser({
            id: payload.id || 'usr-default',
            email: payload.email || '',
            name: payload.name || 'User',
            role: payload.role || ROLES.EMPLOYEE,
            isActive: true,
          });
          setTokenState(storedToken);
        } else {
          clearToken();
        }
      } else {
        clearToken();
      }
    } catch {
      clearToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(email, password);
      setToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      clearToken();
      setTokenState(null);
      setUser(null);
      window.location.href = '/login';
    }
  }, []);

  /**
   * Dev-only role switcher when VITE_USE_MOCK=true
   */
  const switchMockRole = useCallback((newRole) => {
    if (!USE_MOCK) return;
    setUser((prev) => {
      if (!prev) return prev;
      const names = {
        [ROLES.OWNER]: 'Test Owner',
        [ROLES.SALES]: 'Test Sales',
        [ROLES.MANAGER]: 'Durgadas Barhate',
        [ROLES.EMPLOYEE]: 'Test Employee',
        [ROLES.HR]: 'Test HR',
      };
      return {
        ...prev,
        role: newRole,
        name: names[newRole] || prev.name,
      };
    });
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    logout,
    switchMockRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

