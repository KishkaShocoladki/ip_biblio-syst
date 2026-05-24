import { useState } from 'react';
import { APP_CONFIG } from '../config';
import { useCrud } from '../hooks/useCrud';
import { useSearch } from '../hooks/useSearch';
import { useAuth } from '../context/AuthContext';
import EntityForm from '../components/shared/EntityForm';
import FilterBar from '../components/shared/FilterBar';
import Modal from '../components/ui/Modal';

export default function SecondaryListPage() {
  const cfg = APP_CONFIG;
  const { isAdmin } = useAuth();

  const { search, setSearch, filters, setFilter, reset, params } = useSearch();
  const { items, loading, error, create, update, remove } = useCrud(cfg.secondary.endpoint, params);
  const { items: categories } = useCrud(cfg.tag?.endpoint);
  const { items: projects }   = useCrud(cfg.primary.endpoint);

  const [modal,   setModal]   = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [confirm, setConfirm] = useState(null);

  const openCreate = () => { setEditing(null); setSaveErr(''); setModal('create'); };
  const openEdit   = (it) => { setEditing(it);  setSaveErr(''); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); };

  const handleSubmit = async (values) => {
    setSaving(true); setSaveErr('');
    try {
      if (modal === 'edit') await update(editing.id, values);
      else await create(values);
      closeModal();
    } catch (e) { setSaveErr(e.response?.data?.error || 'Ошибка'); }
    finally { setSaving(false); }
  };

  const getRef = (id, list, key = 'name') => {
    const f = list.find(x => x.id === id || x.id === Number(id));
    return f ? (f[key] || f.name || f.title) : '';
  };

  const theme = cfg.themeKey;

  // Filter by search locally
  const filtered = items.filter(it => {
    const name = it.name || it.title || '';
    return !search || name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="page-header">
        <i className={`bi bi-${cfg.secondary.icon}`} style={{ fontSize: '1.35rem', color: 'var(--accent)' }}></i>
        <h1 className="page-title">{cfg.secondary.plural}</h1>
        {isAdmin && (
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={openCreate}>
              <i className="bi bi-plus"></i> Создать
            </button>
          </div>
        )}
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <span className="search-icon"><i className="bi bi-search"></i></span>
          <input className="search-input" placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading && <div className="loading"><span className="spinner"></span> Загрузка...</div>}
      {error   && <div className="alert alert-error"><i className="bi bi-exclamation-triangle"></i> {error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <i className={`bi bi-${cfg.secondary.icon}`}></i><p>Нет записей.</p>
        </div>
      )}

      {/* ── Library: book cards ──────────────────────────── */}
      {theme === 'library' && (
        <div className="grid grid-3">
          {filtered.map(it => (
            <div key={it.id} className="card">
              <div className="card-img">
                {it.cover
                  ? <img src={it.cover} alt={it.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <i className="bi bi-book"></i>
                }
              </div>
              <div className="card-body">
                <div className="card-title">{it.title}</div>
                <div className="card-subtitle">{it.author}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  {it.year    && <span className="badge">{it.year}</span>}
                  {it.categoryId && <span className="badge badge-accent">{getRef(it.categoryId, categories)}</span>}
                  {it.copies != null && <span className="badge"><i className="bi bi-layers"></i> {it.copies} экз.</span>}
                </div>
                {it.isbn && <div style={{ fontSize: '.78rem', color: 'var(--text-dim)' }}>ISBN: {it.isbn}</div>}
                {it.description && (
                  <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
                    {it.description.slice(0, 100)}{it.description.length > 100 ? '…' : ''}
                  </p>
                )}
                {isAdmin && (
                  <div className="card-actions">
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(it)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} onClick={() => setConfirm(it)}><i className="bi bi-trash"></i></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Access Control: room cards ───────────────────── */}
      {theme === 'access' && (
        <div className="grid grid-3">
          {filtered.map(it => {
            const levelMap = { '1': 'Общий', '2': 'Ограниченный', '3': 'Секретный' };
            const levelCls = { '1': 'status-enter', '2': 'status-paused', '3': 'status-denied' };
            return (
              <div key={it.id} className="card">
                <div className="card-img" style={{ height: 80, fontSize: '2.5rem' }}>
                  <i className="bi bi-building"></i>
                </div>
                <div className="card-body">
                  <div className="card-title">{it.name}</div>
                  <div className="card-subtitle">
                    {it.building && `Корпус ${it.building}`}{it.floor != null ? `, ${it.floor} эт.` : ''}
                  </div>
                  <span className={`badge ${levelCls[it.accessLevel] || ''}`}>
                    <i className="bi bi-shield-lock"></i> {levelMap[it.accessLevel] || it.accessLevel}
                  </span>
                  {it.description && (
                    <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>{it.description}</p>
                  )}
                  {isAdmin && (
                    <div className="card-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(it)}><i className="bi bi-pencil"></i></button>
                      <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} onClick={() => setConfirm(it)}><i className="bi bi-trash"></i></button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── VCS: milestone rows ──────────────────────────── */}
      {theme === 'vcs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(it => {
            const stCls = { open: 'status-open', closed: 'status-closed' };
            const stLbl = { open: 'Открыт', closed: 'Закрыт' };
            return (
              <div key={it.id} className="card" style={{ padding: '13px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <i className="bi bi-flag" style={{ color: 'var(--accent)', fontSize: '1.1rem', marginTop: 2, flexShrink: 0 }}></i>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{it.title}</div>
                  <div style={{ fontSize: '.82rem', color: 'var(--text-muted)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span><i className="bi bi-folder2-open"></i> {getRef(it.projectId, projects, 'name')}</span>
                    {it.dueDate && <span><i className="bi bi-calendar"></i> {it.dueDate}</span>}
                    {it.description && <span>{it.description.slice(0, 80)}{it.description.length > 80 ? '…' : ''}</span>}
                  </div>
                </div>
                <span className={`badge ${stCls[it.status] || ''}`}>{stLbl[it.status] || it.status}</span>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(it)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} onClick={() => setConfirm(it)}><i className="bi bi-trash"></i></button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'edit' ? `Редактировать ${cfg.secondary.singular}` : `Новый ${cfg.secondary.singular}`} onClose={closeModal}>
          <EntityForm fields={cfg.secondaryFields} initial={editing || {}} onSubmit={handleSubmit} onCancel={closeModal} loading={saving} error={saveErr} />
        </Modal>
      )}
      {confirm && (
        <Modal title="Удалить?" onClose={() => setConfirm(null)}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 14 }}>Удалить <strong>{confirm.name || confirm.title}</strong>?</p>
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
