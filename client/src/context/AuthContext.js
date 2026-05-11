import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearAuthToken, getAuthToken, saveAuthToken } from '../utils/authStorage';
import { getCurrentUser, loginUser, registerUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    async function loadUser() {
      const token = getAuthToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        setUser(response.user);
      } catch (error) {
        clearAuthToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function login(credentials) {
    const response = await loginUser(credentials);
    saveAuthToken(response.token);
    setUser(response.user);
    return response.user;
  }

  async function register(details) {
    const response = await registerUser(details);
    saveAuthToken(response.token);
    setUser(response.user);
    return response.user;
  }

  function logout() {
    clearAuthToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
