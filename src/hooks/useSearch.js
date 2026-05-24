import { useState, useCallback } from 'react';
import { useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export function useSearch(initial = {}) {
  const [search,  setSearch]  = useState('');
  const [filters, setFilters] = useState(initial);
  const setFilter = useCallback((k, v) => setFilters(p => ({ ...p, [k]: v })), []);
  const reset     = useCallback(() => { setSearch(''); setFilters(initial); }, []);
  const params = {
    ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v !== '' && v != null)),
    ...(search ? { q: search } : {}),
  };
  return { search, setSearch, filters, setFilter, reset, params };
}

export function useFavorites(itemType) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!user) { setFavorites([]); return; }
    api.get(`/favorites?userId=${user.id}&itemType=${itemType}`)
      .then(res => setFavorites(res.data)).catch(() => {});
  }, [user, itemType]);

  const isFav = useCallback((id) => favorites.some(f => f.itemId === id && f.itemType === itemType), [favorites, itemType]);

  const toggle = useCallback(async (itemId) => {
    if (!user) return;
    const ex = favorites.find(f => f.itemId === itemId && f.itemType === itemType);
    if (ex) {
      await api.delete(`/favorites/${ex.id}`);
      setFavorites(p => p.filter(f => f.id !== ex.id));
    } else {
      const res = await api.post('/favorites', { userId: user.id, itemId, itemType });
      setFavorites(p => [...p, res.data]);
    }
  }, [user, favorites, itemType]);

  return { favorites, isFav, toggle };
}
