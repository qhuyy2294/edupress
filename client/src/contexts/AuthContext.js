/**
 * Authentication Context
 * Global state management for user authentication
 */

import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on initial mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedToken = authService.getToken();
        const storedUser = authService.getCurrentUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        setToken(response.data.token);
        setUser(response.data);
        setIsAuthenticated(true);
        return { success: true, data: response.data };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        setToken(response.data.token);
        setUser(response.data);
        setIsAuthenticated(true);
        return { success: true, data: response.data };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      if (response.success) {
        setUser(response.data);
        return { success: true, data: response.data };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Profile update failed. Please try again.';
      return { success: false, message };
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is admin
  const isAdmin = () => hasRole('admin');

  // Check if user is provider
  const isProvider = () => hasRole('provider');

  // Check if user is customer
  const isCustomer = () => hasRole('customer');

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
    updateProfile,
    hasRole,
    isAdmin,
    isProvider,
    isCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
