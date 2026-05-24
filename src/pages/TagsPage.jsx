import { useState } from 'react';
import { APP_CONFIG } from '../config';
import { useCrud } from '../hooks/useCrud';
import { useSearch } from '../hooks/useSearch';
import { useAuth } from '../context/AuthContext';
import EntityForm from '../components/shared/EntityForm';
import Modal from '../components/ui/Modal';

const PRIORITY_CLS  = { low: 'priority-low', medium: 'priority-medium', high: 'priority-high', critical: 'priority-critical' };
const PRIORITY_LBL  = { low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический' };
const TYPE_CLS      = { bug: 'type-bug', feature: 'type-feature', task: 'type-task', docs: 'type-docs' };
const STATUS_CLS    = { open: 'status-open', in_progress: 'status-in_progress', review: 'status-review', closed: 'status-closed' };
const STATUS_LBL    = { open: 'Открыт', in_progress: 'В работе', review: 'На ревью', closed: 'Закрыт' };

export default function TagsPage() {
  const cfg = APP_CONFIG;
  const { user, isAdmin } = useAuth();

  const { search, setSearch } = useSearch();
  const { items, loading, error, create, update, remove } = useCrud(cfg.tag.endpoint);
  const { items: projects }  = useCrud(cfg.primary.endpoint);
  const { items: milestones }= useCrud(cfg.secondary.endpoint);
  const { items: users }     = useCrud('users');

  const [modal,   setModal]   = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [saveErr, setSaveErr] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const canCreate = !cfg.tag.adminOnly || isAdmin;

  const openCreate = () => { setEditing(null); setSaveErr(''); setModal('create'); };
  const openEdit   = (it) => { setEditing(it);  setSaveErr(''); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); };

  const handleSubmit = async (values) => {
    setSaving(true); setSaveErr('');
    try {
      const payload = { ...values, userId: user?.id, createdAt: editing?.createdAt || new Date().toISOString() };
      if (modal === 'edit') await update(editing.id, payload);
      else await create(payload);
      closeModal();
    } catch (e) { setSaveErr(e.response?.data?.error || 'Ошибка'); }
    finally { setSaving(false); }
  };

  const getRef = (id, list, key = 'name') => {
    const f = list.find(x => x.id === id || x.id === Number(id));
    return f ? (f[key] || f.name || f.title || f.username) : '—';
  };

  const theme = cfg.themeKey;

  const filtered = items.filter(it => {
    const name = it.name || it.title || '';
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || it.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <i className={`bi bi-${cfg.tag.icon}`} style={{ fontSize: '1.35rem', color: 'var(--accent)' }}></i>
        <h1 className="page-title">{cfg.tag.plural}</h1>
        {canCreate && (
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
        {theme === 'vcs' && (
          <select className="form-control" style={{ width: 'auto', minWidth: 140 }}
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Все статусы</option>
            <option value="open">Открыт</option>
            <option value="in_progress">В работе</option>
            <option value="review">На ревью</option>
            <option value="closed">Закрыт</option>
          </select>
        )}
      </div>

      {loading && <div className="loading"><span className="spinner"></span> Загрузка...</div>}
      {error   && <div className="alert alert-error">{error}</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state"><i className={`bi bi-${cfg.tag.icon}`}></i><p>Нет записей.</p></div>
      )}

      {/* ── Library: category tags ───────────────────────── */}
      {theme === 'library' && (
        <div className="grid grid-3">
          {filtered.map(it => (
            <div key={it.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {it.color && <span style={{ width: 14, height: 14, background: it.color, flexShrink: 0 }}></span>}
                <i className="bi bi-tag" style={{ color: 'var(--accent)' }}></i>
                <span style={{ fontWeight: 600, flex: 1 }}>{it.name}</span>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(it)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} onClick={() => remove(it.id)}><i className="bi bi-trash"></i></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Access Control: role cards ───────────────────── */}
      {theme === 'access' && (
        <div className="grid grid-3">
          {filtered.map(it => (
            <div key={it.id} className="card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                {it.color && <span style={{ width: 12, height: 12, background: it.color, flexShrink: 0 }}></span>}
                <i className="bi bi-person-badge" style={{ color: 'var(--accent)' }}></i>
                <span style={{ fontWeight: 600, flex: 1 }}>{it.name}</span>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(it)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} onClick={() => remove(it.id)}><i className="bi bi-trash"></i></button>
                  </div>
                )}
              </div>
              {it.description && <p style={{ fontSize: '.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{it.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* ── VCS: issue list ──────────────────────────────── */}
      {theme === 'vcs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(it => (
            <div key={it.id} className="issue-row">
              <i className={`bi bi-circle${it.status === 'closed' ? '-fill' : ''}`}
                style={{ color: it.status === 'closed' ? 'var(--text-dim)' : 'var(--accent)', flexShrink: 0, marginTop: 3 }}></i>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 3 }}>{it.title}</div>
                <div className="issue-meta">
                  {it.type     && <span className={`badge ${TYPE_CLS[it.type] || ''}`}>{it.type}</span>}
                  {it.priority && <span className={`badge ${PRIORITY_CLS[it.priority] || ''}`}>{PRIORITY_LBL[it.priority] || it.priority}</span>}
                  {it.status   && <span className={`badge ${STATUS_CLS[it.status] || ''}`}>{STATUS_LBL[it.status] || it.status}</span>}
                  {it.projectId   && <span className="badge"><i className="bi bi-folder2-open"></i> {getRef(it.projectId, projects, 'name')}</span>}
                  {it.milestoneId && <span className="badge"><i className="bi bi-flag"></i> {getRef(it.milestoneId, milestones, 'title')}</span>}
                  {it.assigneeId  && <span className="badge"><i className="bi bi-person"></i> {getRef(it.assigneeId, users, 'username')}</span>}
                </div>
                {it.description && (
                  <div style={{ fontSize: '.8rem', color: 'var(--text-dim)', marginTop: 4 }}>
                    {it.description.slice(0, 120)}{it.description.length > 120 ? '…' : ''}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {(isAdmin || it.userId === user?.id) && (
                  <>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(it)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} onClick={() => remove(it.id)}><i className="bi bi-trash"></i></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'edit' ? `Редактировать ${cfg.tag.singular}` : `Новый ${cfg.tag.singular}`} onClose={closeModal}>
          <EntityForm fields={cfg.tagFields} initial={editing || {}} onSubmit={handleSubmit} onCancel={closeModal} loading={saving} error={saveErr} />
        </Modal>
      )}
    </div>
  );
}
