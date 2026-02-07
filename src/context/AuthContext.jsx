import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// ✅ This correctly reads from Vercel's environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set default base URL for all axios calls in the app
  axios.defaults.baseURL = API_BASE_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Now using the relative path because baseURL is set above
        const { data } = await axios.get('/api/auth/me');
        setUser(data);
      } catch (err) {
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
    localStorage.setItem('token', userToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    setToken(userToken);
    setUser(userData);
    setLoading(false); 
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, API_BASE_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);