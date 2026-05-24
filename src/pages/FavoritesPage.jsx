import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../config';
import { useFavorites } from '../hooks/useFavorites';
import { useCrud } from '../hooks/useCrud';
import { useAuth } from '../context/AuthContext';
import EntityCard from '../components/shared/EntityCard';

export default function FavoritesPage() {
  const cfg = APP_CONFIG;
  const { user } = useAuth();
  const navigate  = useNavigate();

  const { favorites, toggle, isFav } = useFavorites(cfg.primary.endpoint);
  const { items: primaryItems }      = useCrud(cfg.primary.endpoint);
  const { items: secondaryItems }    = useCrud(cfg.secondary.endpoint);
  const { items: tagItems }          = useCrud(cfg.tag?.endpoint);

  const refs = { [cfg.secondary.endpoint]: secondaryItems };

  // Filter primary items that are in favorites
  const favIds  = favorites.map(f => f.itemId);
  const favItems = primaryItems.filter(it => favIds.includes(it.id));

  if (!user) {
    return (
      <div className="empty-state" style={{ marginTop: 60 }}>
        <i className="bi bi-lock"></i>
        <p>Войдите, чтобы видеть избранное.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <i className="bi bi-heart" style={{ fontSize: '1.4rem', color: 'var(--accent)' }}></i>
        <h1 className="page-title">{cfg.favorites?.label || 'Избранное'}</h1>
      </div>

      {favItems.length === 0 && (
        <div className="empty-state">
          <i className="bi bi-heart"></i>
          <p>Пока ничего нет. Добавляйте в избранное из списка.</p>
        </div>
      )}

      <div className="grid grid-3">
        {favItems.map(item => (
          <EntityCard
            key={item.id}
            item={item}
            cardConfig={cfg.primaryCard}
            refs={refs}
            tags={tagItems}
            onView={(it) => navigate(`/${cfg.primary.endpoint}/${it.id}`)}
            onFav={toggle}
            isFav={isFav(item.id)}
            showFav={true}
            onEdit={null}
            onDelete={null}
            canEdit={false}
          />
        ))}
      </div>
    </div>
  );
}
