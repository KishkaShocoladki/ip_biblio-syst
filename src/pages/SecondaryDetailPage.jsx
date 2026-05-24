import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../config';
import { useItem, useCrud } from '../hooks/useCrud';
import { useAuth } from '../context/AuthContext';
import EntityForm from '../components/shared/EntityForm';
import Modal from '../components/ui/Modal';
import api from '../utils/api';

export default function SecondaryDetailPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const cfg       = APP_CONFIG;
  const { isAdmin } = useAuth();

  const { item, loading, error } = useItem(cfg.secondary.endpoint, id);
  const { items: primaryItems } = useCrud(cfg.primary.endpoint);

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
      await api.put(`/${cfg.secondary.endpoint}/${id}`, values);
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
    await api.delete(`/${cfg.secondary.endpoint}/${id}`);
    navigate(`/${cfg.secondary.endpoint}`);
  };

  if (loading) return <div className="loading"><span className="spinner"></span> Загрузка...</div>;
  if (error)   return <div className="alert alert-error"><i className="bi bi-exclamation-triangle"></i> {error}</div>;
  if (!item)   return null;

  const image = cfg.secondaryCard.imageKey ? item[cfg.secondaryCard.imageKey] : null;

  return (
    <div>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <h1 className="page-title">{item[cfg.secondaryCard.titleKey]}</h1>
        <div className="page-header-actions">
          {isAdmin && (
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
              ? <img src={image} alt={item[cfg.secondaryCard.titleKey]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <i className={`bi bi-${cfg.secondary.icon}`}></i>
            }
          </div>
        </div>

        <div className="detail-main">
          {/* Meta info */}
          <div>
            <div className="section-title">Информация</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {Object.entries(cfg.secondaryFields).map(([, f]) => {
                  if (f.type === 'multiselect' || f.type === 'textarea') return null;
                  if (f.type === 'select' && f.refEndpoint) {
                    const refList = f.refEndpoint === cfg.secondary.endpoint ? [] : primaryItems;
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

          {/* Related primary items */}
          {(() => {
            const refFieldKey = cfg.primaryFields[Object.keys(cfg.primaryFields).find(k => cfg.primaryFields[k].refEndpoint === cfg.secondary.endpoint)]?.key;
            const relatedItems = refFieldKey ? primaryItems.filter(p => String(p[refFieldKey]) === String(item.id)) : [];
            return relatedItems.length > 0 && (
              <div>
                <div className="section-title">Связанные {cfg.primary.plural.toLowerCase()}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {relatedItems.map(p => (
                    <a
                      key={p.id}
                      href={`/${cfg.primary.endpoint}/${p.id}`}
                      className="card"
                      style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}
                    >
                      <i className={`bi bi-${cfg.primary.icon}`} style={{ color: 'var(--accent)' }}></i>
                      <span style={{ flex: 1 }}>{p[cfg.primaryCard.titleKey]}</span>
                      <i className="bi bi-chevron-right" style={{ color: 'var(--text-dim)' }}></i>
                    </a>
                  ))}
              </div>
                </div>
              );
            })()}
        </div>
      </div>

      {modal && (
        <Modal title={`Редактировать ${cfg.secondary.singular}`} onClose={() => setModal(false)}>
          <EntityForm
            fields={cfg.secondaryFields}
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
  return (
    <tr>
      <td style={{ padding: '12px 0', fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500, paddingRight: 16, maxWidth: 150 }}>
        {label}
      </td>
      <td style={{ padding: '12px 0', fontSize: '0.88rem' }}>
        {value}
      </td>
    </tr>
  );
}
