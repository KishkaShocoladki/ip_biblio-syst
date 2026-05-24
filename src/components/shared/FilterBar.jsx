import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function FilterBar({ filterConfig = [], search, onSearch, filters, onFilter, onReset }) {
  const [refs, setRefs] = useState({});

  useEffect(() => {
    const rf = filterConfig.filter(f => f.refEndpoint);
    if (!rf.length) return;
    Promise.all(rf.map(f => api.get(`/${f.refEndpoint}`).then(r => ({ key: f.key, data: r.data }))))
      .then(results => {
        const m = {};
        results.forEach(({ key, data }) => { m[key] = data; });
        setRefs(m);
      }).catch(() => {});
  }, [JSON.stringify(filterConfig)]);

  const hasActive = search || Object.values(filters).some(v => v !== '' && v != null);

  return (
    <div className="filter-bar">
      <div className="search-box">
        <span className="search-icon"><i className="bi bi-search"></i></span>
        <input className="search-input" placeholder="Поиск..." value={search} onChange={e => onSearch(e.target.value)} />
      </div>

      {filterConfig.map(f => {
        if (f.refEndpoint) {
          const opts = refs[f.key] || [];
          return (
            <select key={f.key} className="form-control" style={{ width: 'auto', minWidth: 140 }}
              value={filters[f.key] || ''} onChange={e => onFilter(f.key, e.target.value ? Number(e.target.value) : '')}>
              <option value="">Все: {f.label}</option>
              {opts.map(o => <option key={o.id} value={o.id}>{o.name || o.title}</option>)}
            </select>
          );
        }
        if (f.type === 'select-static') return (
          <select key={f.key} className="form-control" style={{ width: 'auto', minWidth: 140 }}
            value={filters[f.key] || ''} onChange={e => onFilter(f.key, e.target.value)}>
            <option value="">Все: {f.label}</option>
            {(f.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
        return (
          <input key={f.key} className="form-control" style={{ width: 'auto', minWidth: 130 }}
            placeholder={f.label} value={filters[f.key] || ''} onChange={e => onFilter(f.key, e.target.value)} />
        );
      })}

      {hasActive && (
        <button className="btn btn-ghost btn-sm" onClick={onReset}>
          <i className="bi bi-x-circle"></i> Сброс
        </button>
      )}
    </div>
  );
}
