import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const recordSessionEvent = useCallback(async (userId, type) => {
    try {
      await api.post('/events', {
        employeeId: userId,
        type,
        timestamp: new Date().toISOString(),
        notes: '',
      });
    } catch (err) {
      console.warn('Failed to record session event', err);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    await recordSessionEvent(res.data.user.id, 'enter');
    return res.data.user;
  }, [recordSessionEvent]);

  const register = useCallback(async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    await recordSessionEvent(res.data.user.id, 'enter');
    return res.data.user;
  }, [recordSessionEvent]);

  const logout = useCallback(async () => {
    if (user?.id) {
      await recordSessionEvent(user.id, 'exit');
    }
    localStorage.removeItem('token');
    setUser(null);
  }, [user?.id, recordSessionEvent]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }
