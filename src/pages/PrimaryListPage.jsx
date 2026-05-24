import { useState } from 'react';
import { APP_CONFIG } from '../config';
import { useCrud } from '../hooks/useCrud';
import { useSearch } from '../hooks/useSearch';
import { useAuth } from '../context/AuthContext';
import EntityForm from '../components/shared/EntityForm';
import FilterBar from '../components/shared/FilterBar';
import Modal from '../components/ui/Modal';

// Status labels + css class per theme
const STATUS_MAP = {
  // library loans
  active:      { label: 'На руках',   cls: 'status-active' },
  returned:    { label: 'Возвращена', cls: 'status-returned' },
  overdue:     { label: 'Просрочена', cls: 'status-overdue' },
  // access events
  enter:       { label: 'Вход',       cls: 'status-enter' },
  exit:        { label: 'Выход',      cls: 'status-exit' },
  denied:      { label: 'Отказ',      cls: 'status-denied' },
  // vcs projects
  active_p:    { label: 'Активный',   cls: 'status-active' },
  archived:    { label: 'Архив',      cls: 'status-archived' },
  paused:      { label: 'Пауза',      cls: 'status-paused' },
};

function statusBadge(val) {
  const s = STATUS_MAP[val];
  if (!s) return <span className="badge">{val}</span>;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export default function PrimaryListPage() {
  const cfg = APP_CONFIG;
  const { user, isAdmin } = useAuth();

  if (cfg.themeKey === 'access' && !isAdmin) {
    return (
      <div className="empty-state" style={{ marginTop: 40 }}>
        <i className="bi bi-shield-lock" style={{ fontSize: '2.5rem' }}></i>
        <p>Раздел сессий доступен только администратору.</p>
      </div>
    );
  }

  const { search, setSearch, filters, setFilter, reset, params } = useSearch();
  const { items, loading, error, create, update, remove } = useCrud(cfg.primary.endpoint, params);
  const { items: users }     = useCrud('users');
  const { items: secondary } = useCrud(cfg.secondary.endpoint);

  const [modal,   setModal]   = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [confirm, setConfirm] = useState(null);

  const canCreate = cfg.themeKey === 'access' ? false : (isAdmin || (!cfg.primary.adminOnly && !!user));

  const openCreate = () => { setEditing(null); setSaveErr(''); setModal('create'); };
  const openEdit   = (it) => { setEditing(it);  setSaveErr(''); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); };

  const handleSubmit = async (values) => {
    setSaving(true); setSaveErr('');
    try {
      const payload = { ...values, createdAt: editing?.createdAt || new Date().toISOString() };
      if (modal === 'edit') await update(editing.id, payload);
      else await create(payload);
      closeModal();
    } catch (e) { setSaveErr(e.response?.data?.error || 'Ошибка'); }
    finally { setSaving(false); }
  };

  const getName = (id, list, key = 'name') => {
    const f = list.find(x => x.id === id || x.id === Number(id));
    return f ? (f[key] || f.name || f.title || f.username) : '—';
  };

  const theme = cfg.themeKey;

  return (
    <div>
      <div className="page-header">
        <i className={`bi bi-${cfg.primary.icon}`} style={{ fontSize: '1.35rem', color: 'var(--accent)' }}></i>
        <h1 className="page-title">{cfg.primary.plural}</h1>
        <div className="page-header-actions">
          {canCreate && (
            <button className="btn btn-primary" onClick={openCreate}>
              <i className="bi bi-plus"></i> Создать
            </button>
          )}
        </div>
      </div>

      <FilterBar
        filterConfig={cfg.filters}
        search={search} onSearch={setSearch}
        filters={filters} onFilter={setFilter} onReset={reset}
      />

      {loading && <div className="loading"><span className="spinner"></span> Загрузка...</div>}
      {error   && <div className="alert alert-error"><i className="bi bi-exclamation-triangle"></i> {error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <i className={`bi bi-${cfg.primary.icon}`}></i>
          <p>Записей нет.</p>
        </div>
      )}

      {/* ── Library: loans table ─────────────────────────── */}
      {theme === 'library' && items.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
                {['Книга','Посетитель','Выдана','Вернуть до','Возвращена','Статус',''].map(h => (
                  <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: '.78rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(it => (
                <tr key={it.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{getName(it.bookId, secondary, 'title')}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{getName(it.visitorId, users, 'username')}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{it.issuedAt || '—'}</td>
                  <td style={{ padding: '10px 12px', color: it.status === 'overdue' ? 'var(--danger)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{it.returnBy || '—'}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{it.returnedAt || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>{statusBadge(it.status)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    {isAdmin && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(it)}><i className="bi bi-pencil"></i></button>
                        <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} onClick={() => setConfirm(it)}><i className="bi bi-trash"></i></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Access Control: событие вход/выход ───────────────── */}
      {theme === 'access' && items.map(it => (
        <div key={it.id} className="event-row">
          <i className={`bi bi-${it.type === 'enter' ? 'door-open' : it.type === 'exit' ? 'door-closed' : 'x-circle'} event-icon ${it.type}`}></i>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>
              {getName(it.employeeId, users, 'username')}
              <span style={{ margin: '0 6px', color: 'var(--text-dim)' }}>{statusBadge(it.type)}</span>
            </div>
            <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {it.timestamp ? it.timestamp.replace('T', ' ') : ''}
              {it.notes && <span style={{ marginLeft: 10 }}>{it.notes}</span>}
            </div>
          </div>
          {isAdmin && theme !== 'access' && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(it)}><i className="bi bi-pencil"></i></button>
              <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} onClick={() => setConfirm(it)}><i className="bi bi-trash"></i></button>
            </div>
          )}
        </div>
      ))}

      {/* ── VCS: project cards ───────────────────────────── */}
      {theme === 'vcs' && (
        <div className="grid grid-3">
          {items.map(it => (
            <ProjectCard
              key={it.id}
              item={it}
              onEdit={isAdmin || it.userId === user?.id ? () => openEdit(it) : null}
              onDelete={isAdmin || it.userId === user?.id ? () => setConfirm(it) : null}
            />
          ))}
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────── */}
      {modal && (
        <Modal title={modal === 'edit' ? `Редактировать ${cfg.primary.singular}` : `Новый ${cfg.primary.singular}`} onClose={closeModal}>
          <EntityForm fields={cfg.primaryFields} initial={editing || {}} onSubmit={handleSubmit} onCancel={closeModal} loading={saving} error={saveErr} />
        </Modal>
      )}

      {confirm && (
        <Modal title="Удалить?" onClose={() => setConfirm(null)}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 14 }}>Удалить запись?</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-danger" onClick={async () => { await remove(confirm.id); setConfirm(null); }}>
              <i className="bi bi-trash"></i> Удалить
            </button>
            <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Отмена</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ProjectCard({ item, onEdit, onDelete }) {
  const statusMap = { active: 'Активный', archived: 'Архив', paused: 'Пауза' };
  const statusCls = { active: 'status-active', archived: 'status-archived', paused: 'status-paused' };
  return (
    <div className="card">
      <div className="card-body">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
          <i className="bi bi-folder2-open" style={{ color: 'var(--accent)', fontSize: '1.1rem', marginTop: 2 }}></i>
          <div style={{ flex: 1 }}>
            <div className="card-title" style={{ marginBottom: 2 }}>{item.name}</div>
            {item.language && <span className="badge" style={{ fontSize: '.73rem' }}>{item.language}</span>}
          </div>
          <span className={`badge ${statusCls[item.status] || ''}`}>{statusMap[item.status] || item.status}</span>
        </div>
        {item.description && (
          <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
            {item.description.slice(0, 100)}{item.description.length > 100 ? '…' : ''}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem', color: 'var(--text-muted)' }}>
          <i className={`bi bi-${item.visibility === 'private' ? 'lock' : 'globe'}`}></i>
          {item.visibility === 'private' ? 'Приватный' : 'Публичный'}
          {item.stars != null && (
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <i className="bi bi-star"></i> {item.stars}
            </span>
          )}
        </div>
        {(onEdit || onDelete) && (
          <div className="card-actions">
            {onEdit   && <button className="btn btn-ghost btn-sm btn-icon" onClick={onEdit}><i className="bi bi-pencil"></i></button>}
            {onDelete && <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} onClick={onDelete}><i className="bi bi-trash"></i></button>}
          </div>
        )}
      </div>
    </div>
  );
}
