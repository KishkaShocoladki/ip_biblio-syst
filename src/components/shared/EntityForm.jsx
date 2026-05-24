import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function EntityForm({ fields, initial = {}, onSubmit, onCancel, loading, error }) {
  const [values, setValues] = useState({});
  const [refs,   setRefs]   = useState({});

  const refEndpoints = [...new Set(
    Object.values(fields)
      .filter(f => (f.type === 'select' || f.type === 'multiselect') && f.refEndpoint)
      .map(f => f.refEndpoint)
  )];

  useEffect(() => {
    const init = {};
    Object.values(fields).forEach(f => {
      init[f.key] = initial[f.key] ?? (f.type === 'checkbox' ? false : f.type === 'multiselect' ? [] : '');
    });
    setValues(init);
  }, [JSON.stringify(initial), JSON.stringify(fields)]);

  useEffect(() => {
    if (!refEndpoints.length) return;
    Promise.all(
      refEndpoints.map(ep => api.get(`/${ep}`).then(r => ({ ep, data: r.data })))
    ).then(results => {
      const map = {};
      results.forEach(({ ep, data }) => { map[ep] = data; });
      setRefs(map);
    }).catch(() => {});
  }, [refEndpoints.join(',')]);

  const set = (k, v) => setValues(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => { e.preventDefault(); onSubmit(values); };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-error">
          <i className="bi bi-exclamation-triangle"></i> {error}
        </div>
      )}
      {Object.values(fields).map(f => (
        <div className="form-group" key={f.key}>
          <label className="form-label">
            {f.label} {f.required && <span style={{ color: 'var(--danger)' }}>*</span>}
          </label>
          <FieldInput field={f} value={values[f.key]} onChange={v => set(f.key, v)} refs={refs} />
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <><span className="spinner"></span> Сохранение...</> : 'Сохранить'}
        </button>
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}>Отмена</button>}
      </div>
    </form>
  );
}

function FieldInput({ field: f, value, onChange, refs }) {
  if (f.type === 'textarea') return (
    <textarea className="form-control" value={value || ''} onChange={e => onChange(e.target.value)} required={f.required} rows={3} />
  );

  if (f.type === 'checkbox') return (
    <div className="form-check">
      <input type="checkbox" id={f.key} checked={!!value} onChange={e => onChange(e.target.checked)} />
      <label htmlFor={f.key} style={{ fontSize: '.88rem', color: 'var(--text-muted)' }}>{f.label}</label>
    </div>
  );

  if (f.type === 'color') return (
    <input type="color" value={value || '#4caf50'} onChange={e => onChange(e.target.value)}
      style={{ height: 38, padding: 2, background: 'var(--bg-surface)', border: '1px solid var(--border)' }} />
  );

  if (f.type === 'select') {
    const options = refs[f.refEndpoint] || [];
    const displayKey = f.refEndpoint === 'users' ? 'username' : (f.refEndpoint === 'milestones' ? 'title' : 'name');
    return (
      <select className="form-control" value={value || ''} onChange={e => onChange(e.target.value ? Number(e.target.value) : '')} required={f.required}>
        <option value="">-- выберите --</option>
        {options.map(o => <option key={o.id} value={o.id}>{o[displayKey] || o.name || o.title}</option>)}
      </select>
    );
  }

  if (f.type === 'select-static') return (
    <select className="form-control" value={value || ''} onChange={e => onChange(e.target.value)} required={f.required}>
      {!f.required && <option value="">-- выберите --</option>}
      {(f.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  if (f.type === 'multiselect') {
    const options = refs[f.refEndpoint] || [];
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="multiselect-options">
        {options.map(o => (
          <label key={o.id} className={`multiselect-option${selected.includes(o.id) ? ' selected' : ''}`}>
            <input type="checkbox" checked={selected.includes(o.id)}
              onChange={() => onChange(selected.includes(o.id) ? selected.filter(id => id !== o.id) : [...selected, o.id])} />
            {o.name || o.title}
          </label>
        ))}
        {!options.length && <div style={{ padding: 10, color: 'var(--text-dim)', fontSize: '.85rem' }}>Нет вариантов</div>}
      </div>
    );
  }

  const inputType = { number: 'number', date: 'date', 'datetime-local': 'datetime-local' }[f.type] || 'text';
  return (
    <input type={inputType} className="form-control" value={value || ''} required={f.required}
      onChange={e => onChange(f.type === 'number' ? Number(e.target.value) : e.target.value)} />
  );
}
