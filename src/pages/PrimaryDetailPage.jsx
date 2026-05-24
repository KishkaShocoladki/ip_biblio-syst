import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../config';
import { useItem, useCrud } from '../hooks/useCrud';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../context/AuthContext';
import EntityForm from '../components/shared/EntityForm';
import Modal from '../components/ui/Modal';
import api from '../utils/api';

export default function PrimaryDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const cfg       = APP_CONFIG;
  const { user, isAdmin } = useAuth();

  if (cfg.themeKey === 'access' && !isAdmin) {
    return (
      <div className="empty-state" style={{ marginTop: 40 }}>
        <i className="bi bi-shield-lock" style={{ fontSize: '2.5rem' }}></i>
        <p>Доступ к сессиям разрешён только администратору.</p>
      </div>
    );
  }

  const { item, loading, error } = useItem(cfg.primary.endpoint, id);
  const { items: secondaryItems } = useCrud(cfg.secondary.endpoint);
  const { items: tagItems }  = useCrud(cfg.tag?.endpoint);
  const { isFav, toggle }    = useFavorites(cfg.primary.endpoint);

  // For streamingArtist: tags that belong to this primary item (tracks of album)
  const ownedTags = tagItems.filter(t => {
    // tracks have albumId, episodes have seasonId — check any fk referencing this item
    return Object.values(t).some(v => String(v) === String(id));
  });

  const [modal, setModal]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  const getRef = (key, list, labelKey = 'name') => {
    if (!item || !item[key]) return '—';
    const found = list.find(x => x.id === item[key] || x.id === Number(item[key]));
    return found ? found[labelKey] : '—';
  };

  const handleUpdate = async (values) => {
    setSaving(true); setSaveErr('');
    try {
      await api.put(`/${cfg.primary.endpoint}/${id}`, { ...values, userId: item.userId, createdAt: item.createdAt });
      setModal(false);
      window.location.reload();
    } catch (e) {
      setSaveErr(e.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить?')) return;
    await api.delete(`/${cfg.primary.endpoint}/${id}`);
    navigate(`/${cfg.primary.endpoint}`);
  };

  const canEdit = cfg.themeKey !== 'access' && (isAdmin || item.userId === user?.id);

  if (loading) return <div className="loading"><span className="spinner"></span> Загрузка...</div>;
  if (error)   return <div className="alert alert-error"><i className="bi bi-exclamation-triangle"></i> {error}</div>;
  if (!item)   return null;
  const image   = cfg.primaryCard.imageKey ? item[cfg.primaryCard.imageKey] : null;
  const tagSelected = Array.isArray(item[cfg.primaryCard.tagsKey])
    ? tagItems.filter(t => item[cfg.primaryCard.tagsKey].includes(t.id))
    : [];

  return (
    <div>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <h1 className="page-title">{item[cfg.primaryCard.titleKey]}</h1>
        <div className="page-header-actions">
          {cfg.favorites?.enabled && user && (
            <button
              className={`fav-btn${isFav(item.id) ? ' active' : ''}`}
              onClick={() => toggle(item.id)}
            >
              <i className={`bi bi-heart${isFav(item.id) ? '-fill' : ''}`}></i>
              {isFav(item.id) ? 'В избранном' : 'В избранное'}
            </button>
          )}
          {canEdit && (
            <>
              <button className="btn btn-secondary" onClick={() => setModal(true)}>
                <i className="bi bi-pencil"></i> Редактировать
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <i className="bi bi-trash"></i>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="detail-layout">
        <div className="detail-sidebar">
          <div className="detail-cover">
            {image
              ? <img src={image} alt={item[cfg.primaryCard.titleKey]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <i className={`bi bi-${cfg.primary.icon}`}></i>
            }
          </div>

          {/* Stats */}
          {cfg.primaryCard.statsKeys?.length > 0 && (
            <div>
              <div className="section-title">Характеристики</div>
              <div className="stats-row">
                {cfg.primaryCard.statsKeys.map(k => item[k] !== undefined && (
                  <div className="stat-box" key={k}>
                    <div className="stat-value">{item[k]}</div>
                    <div className="stat-label">{STAT_LABELS[k] || k}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags / attributes */}
          {tagSelected.length > 0 && (
            <div>
              <div className="section-title">{cfg.tag?.plural}</div>
              <div className="tags-row">
                {tagSelected.map(t => (
                  <span
                    key={t.id}
                    className="badge badge-accent"
                    style={t.color ? { borderColor: t.color, color: t.color } : {}}
                  >
                    <i className={`bi bi-${cfg.tag?.icon}`}></i> {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="detail-main">
          {/* Meta info */}
          <div>
            <div className="section-title">Информация</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {Object.entries(cfg.primaryFields).map(([, f]) => {
                  if (f.type === 'multiselect' || f.type === 'textarea') return null;
                  if (f.type === 'select' && f.refEndpoint) {
                    const refList = f.refEndpoint === cfg.secondary.endpoint ? secondaryItems : tagItems;
                    return (
                      <MetaRow key={f.key} label={f.label} value={getRef(f.key, refList)} />
                    );
                  }
                  if (f.type === 'checkbox') {
                    return <MetaRow key={f.key} label={f.label} value={item[f.key] ? 'Да' : 'Нет'} />;
                  }
                  return <MetaRow key={f.key} label={f.label} value={item[f.key]} />;
                })}
              </tbody>
            </table>
          </div>

          {/* Description */}
          {item.description && (
            <div>
              <div className="section-title">Описание</div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>{item.description}</p>
            </div>
          )}

          {/* Owned tags (e.g. tracks of album, episodes of season) */}
          {ownedTags.length > 0 && (
            <div>
              <div className="section-title">{cfg.tag?.plural} ({ownedTags.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ownedTags.map(t => (
                  <div key={t.id} className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <i className={`bi bi-${cfg.tag?.icon}`} style={{ color: 'var(--accent)' }}></i>
                    <span style={{ flex: 1 }}>{t.name}</span>
                    {t.duration && <span className="badge">{t.duration}</span>}
                    {t.trackNumber && <span className="badge">#{t.trackNumber}</span>}
                    {t.number && <span className="badge">#{t.number}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <Modal title={`Редактировать ${cfg.primary.singular}`} onClose={() => setModal(false)}>
          <EntityForm
            fields={cfg.primaryFields}
            initial={item}
            onSubmit={handleUpdate}
            onCancel={() => setModal(false)}
            loading={saving}
            error={saveErr}
          />
        </Modal>
      )}
    </div>
  );
}

function MetaRow({ label, value }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <tr>
      <td style={{ padding: '6px 0', color: 'var(--text-muted)', fontSize: '0.82rem', width: 140, verticalAlign: 'top' }}>{label}</td>
      <td style={{ padding: '6px 0 6px 12px', fontSize: '0.88rem' }}>{String(value)}</td>
    </tr>
  );
}

const STAT_LABELS = { health: 'HP', attack: 'ATK', defense: 'DEF', speed: 'SPD', rating: 'Рейтинг' };
