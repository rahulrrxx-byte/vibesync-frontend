import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/auth/me`);
        setUser(data);
      } catch (err) {
        // If this fails, it calls logout() and kicks you to AuthPage
        console.error("Token verification failed", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (userData, userToken) => {
    // 1. Save to localStorage immediately
    localStorage.setItem('token', userToken);
    
    // 2. Set the axios header so the next request works
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    
    // 3. Update state
    setToken(userToken);
    setUser(userData);
    
    // 4. IMPORTANT: Set loading to false so ProtectedRoute lets you in!
    setLoading(false); 
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);