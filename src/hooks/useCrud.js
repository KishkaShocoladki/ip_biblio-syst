import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useCrud(endpoint, params = {}) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const buildQuery = useCallback(() => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) q.append(k, v);
    });
    return q.toString() ? `?${q}` : '';
  }, [JSON.stringify(params)]);

  const fetch = useCallback(async () => {
    if (!endpoint) return;
    setLoading(true); setError(null);
    try {
      const res = await api.get(`/${endpoint}${buildQuery()}`);
      setItems(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [endpoint, buildQuery]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = useCallback(async (data) => {
    const res = await api.post(`/${endpoint}`, data);
    setItems(prev => [...prev, res.data]);
    return res.data;
  }, [endpoint]);

  const update = useCallback(async (id, data) => {
    const res = await api.put(`/${endpoint}/${id}`, data);
    setItems(prev => prev.map(it => it.id === id ? res.data : it));
    return res.data;
  }, [endpoint]);

  const remove = useCallback(async (id) => {
    await api.delete(`/${endpoint}/${id}`);
    setItems(prev => prev.filter(it => it.id !== id));
  }, [endpoint]);

  return { items, loading, error, refetch: fetch, create, update, remove };
}

export function useItem(endpoint, id) {
  const [item,    setItem]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!endpoint || !id) return;
    setLoading(true);
    api.get(`/${endpoint}/${id}`)
      .then(res => setItem(res.data))
      .catch(e => setError(e.response?.data?.error || 'Ошибка'))
      .finally(() => setLoading(false));
  }, [endpoint, id]);

  return { item, loading, error };
}
