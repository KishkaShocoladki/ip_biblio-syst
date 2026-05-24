import { useAuth } from '../../context/AuthContext';

/**
 * Generic card for any primary entity.
 */
export default function EntityCard({
  item,
  cardConfig,     // primaryCard / secondaryCard from APP_CONFIG
  refs = {},      // { [refEndpoint]: [...items] }
  tags = [],      // tag items for tagsKey
  onEdit,
  onDelete,
  onView,
  onFav,
  isFav,
  canEdit,        // override — if false, hide edit/delete
  showFav = true,
}) {
  const { user, isAdmin } = useAuth();
  const {
    titleKey, subtitleRef, subtitleKey, tagsKey, statsKeys = [],
    imageKey, metaKey, descKey,
  } = cardConfig;

  const title    = item[titleKey] || '—';
  const subtitle = subtitleRef
    ? getRef(item[subtitleRef.key], refs[subtitleRef.refEndpoint], subtitleRef.refLabel)
    : item[subtitleKey] || '';
  const image    = imageKey ? item[imageKey] : null;
  const meta     = metaKey ? item[metaKey] : null;
  const desc     = descKey ? item[descKey] : null;

  const tagItems = tagsKey && Array.isArray(item[tagsKey])
    ? tags.filter(t => item[tagsKey].includes(t.id))
    : [];

  const editable = typeof canEdit !== 'undefined'
    ? canEdit
    : (isAdmin || (user && Number(item.userId) === Number(user.id)));

  return (
    <div className="card">
      <div className="card-img">
        {image
          ? <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <i className={`bi bi-image`}></i>
        }
      </div>

      <div className="card-body">
        <div className="card-title">{title}</div>
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
        {meta && (
          <span className="badge" style={{ marginBottom: 6 }}>
            {meta}
          </span>
        )}
        {desc && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '6px 0', lineHeight: 1.5 }}>
            {String(desc).slice(0, 100)}{String(desc).length > 100 ? '…' : ''}
          </p>
        )}

        {tagItems.length > 0 && (
          <div className="tags-row">
            {tagItems.map(t => (
              <span
                key={t.id}
                className="badge badge-accent"
                style={t.color ? { borderColor: t.color, color: t.color } : {}}
              >
                {t.name}
              </span>
            ))}
          </div>
        )}

        {statsKeys.length > 0 && (
          <div className="stats-row">
            {statsKeys.map(k => item[k] !== undefined && item[k] !== '' && (
              <div className="stat-box" key={k}>
                <div className="stat-value">{item[k]}</div>
                <div className="stat-label">{STAT_LABELS[k] || k}</div>
              </div>
            ))}
          </div>
        )}

        <div className="card-actions">
          {onView && (
            <button className="btn btn-ghost btn-sm" onClick={() => onView(item)}>
              <i className="bi bi-eye"></i> Подробнее
            </button>
          )}
          {showFav && onFav && user && (
            <button
              className={`fav-btn${isFav ? ' active' : ''}`}
              onClick={() => onFav(item.id)}
            >
              <i className={`bi bi-heart${isFav ? '-fill' : ''}`}></i>
            </button>
          )}
          {editable && onEdit && (
            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onEdit(item)}>
              <i className="bi bi-pencil"></i>
            </button>
          )}
          {editable && onDelete && (
            <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--danger)' }} onClick={() => onDelete(item)}>
              <i className="bi bi-trash"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function getRef(id, list = [], labelKey = 'name') {
  if (!id || !list) return '';
  const found = list.find(i => i.id === id || i.id === Number(id));
  return found ? found[labelKey] : '';
}

const STAT_LABELS = {
  health: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  speed: 'SPD',
  rating: 'Рейтинг',
};
