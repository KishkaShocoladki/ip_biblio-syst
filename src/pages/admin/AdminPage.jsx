import { useState } from 'react';
import { useCrud } from '../../hooks/useCrud';
import { APP_CONFIG } from '../../config';

export default function AdminPage() {
  const cfg = APP_CONFIG;
  const { items: users,     loading: ul } = useCrud('users');
  const { items: primary,   loading: pl } = useCrud(cfg.primary.endpoint);
  const { items: secondary, loading: sl } = useCrud(cfg.secondary.endpoint);
  const { items: tags,      loading: tl } = useCrud(cfg.tag?.endpoint);
  const { items: favorites, loading: fl } = useCrud('favorites');

  const { update: updateUser } = useCrud('users');

  const [tab, setTab] = useState('stats');

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    await updateUser(user.id, { ...user, role: newRole });
    window.location.reload();
  };

  const stats = [
    { label: cfg.user.plural,         value: users.length,     icon: 'people' },
    { label: cfg.primary.plural,      value: primary.length,   icon: cfg.primary.icon },
    { label: cfg.secondary.plural,    value: secondary.length, icon: cfg.secondary.icon },
    { label: cfg.tag?.plural || '',   value: tags.length,      icon: cfg.tag?.icon || 'tag' },
    { label: 'Избранных',             value: favorites.length, icon: 'heart' },
  ];

  return (
    <div>
      <div className="page-header">
        <i className="bi bi-gear" style={{ fontSize: '1.4rem', color: 'var(--accent)' }}></i>
        <h1 className="page-title">Панель управления</h1>
      </div>

      <div className="tabs">
        <button className={`tab${tab === 'stats' ? ' active' : ''}`} onClick={() => setTab('stats')}>
          <i className="bi bi-bar-chart"></i> Статистика
        </button>
        <button className={`tab${tab === 'users' ? ' active' : ''}`} onClick={() => setTab('users')}>
          <i className="bi bi-people"></i> Пользователи
        </button>
      </div>

      {tab === 'stats' && (
        <div>
          <div className="grid grid-3" style={{ marginBottom: 32 }}>
            {stats.map(s => (
              <div key={s.label} className="card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <i className={`bi bi-${s.icon}`} style={{ fontSize: '1.4rem', color: 'var(--accent)' }}></i>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.label}</span>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 700 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div>
          {ul && <div className="loading"><span className="spinner"></span></div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {users.map(u => (
              <div key={u.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <i className="bi bi-person-circle" style={{ fontSize: '1.3rem', color: 'var(--text-muted)' }}></i>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{u.username}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{u.email}</div>
                </div>
                <span className={`badge${u.role === 'admin' ? ' badge-admin' : ''}`}>{u.role}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => toggleRole(u)}
                >
                  {u.role === 'admin' ? 'Убрать admin' : 'Сделать admin'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
