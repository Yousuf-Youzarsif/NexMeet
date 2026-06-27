import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('nexmeet_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nexmeet_token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, ...userData } = res.data;
    localStorage.setItem('nexmeet_token', token);
    localStorage.setItem('nexmeet_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    const { token, ...userData } = res.data;
    localStorage.setItem('nexmeet_token', token);
    localStorage.setItem('nexmeet_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('nexmeet_token');
    localStorage.removeItem('nexmeet_user');
    setUser(null);
  };

  const updateProfile = async (username, profilePicture) => {
    const res = await api.put('/auth/profile', { username, profilePicture });
    const userData = res.data;
    localStorage.setItem('nexmeet_user', JSON.stringify({ ...user, ...userData }));
    setUser({ ...user, ...userData });
    return userData;
  };

  const updatePassword = async (currentPassword, newPassword) => {
    await api.put('/auth/password', { currentPassword, newPassword });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateProfile, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
