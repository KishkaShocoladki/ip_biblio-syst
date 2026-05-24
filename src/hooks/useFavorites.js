import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export function useFavorites(itemType) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading,   setLoading]   = useState(false);

  useEffect(() => {
    if (!user) { setFavorites([]); return; }
    setLoading(true);
    api.get(`/favorites?userId=${user.id}&itemType=${itemType}`)
      .then(res => setFavorites(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, itemType]);

  const isFav = useCallback((itemId) =>
    favorites.some(f => f.itemId === itemId && f.itemType === itemType),
    [favorites, itemType]
  );

  const toggle = useCallback(async (itemId) => {
    if (!user) return;
    const existing = favorites.find(f => f.itemId === itemId && f.itemType === itemType);
    if (existing) {
      await api.delete(`/favorites/${existing.id}`);
      setFavorites(prev => prev.filter(f => f.id !== existing.id));
    } else {
      const res = await api.post('/favorites', {
        userId: user.id, itemId, itemType,
      });
      setFavorites(prev => [...prev, res.data]);
    }
  }, [user, favorites, itemType]);

  return { favorites, loading, isFav, toggle };
}
