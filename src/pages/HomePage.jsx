import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../config';
import { useCrud } from '../hooks/useCrud';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const cfg = APP_CONFIG;
  const { user, isAdmin } = useAuth();
  const canViewPrimary = !(cfg.themeKey === 'access' && !isAdmin);
  const heroIcon = canViewPrimary ? cfg.primary.icon : cfg.secondary.icon;

  const { items: primaryItems }   = useCrud(canViewPrimary ? cfg.primary.endpoint : null);
  const { items: secondaryItems } = useCrud(cfg.secondary.endpoint);
  const { items: users } = useCrud(cfg.themeKey === 'access' ? 'users' : null);

  const recentPrimary = primaryItems.slice(-4).reverse();
  const recentSecondary = secondaryItems.slice(-3).reverse();

  const formatPrimaryLabel = (item) => {
    if (cfg.themeKey === 'access') {
      const employee = users.find(u => String(u.id) === String(item.employeeId));
      const name = employee?.username || 'Пользователь';
      const timestamp = item.timestamp ? ` • ${item.timestamp.replace('T', ' ')}` : '';
      return `${name} — ${item.type}${timestamp}`;
    }
    return item.name || item.title;
  };

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        padding: '40px 36px',
        marginBottom: 32,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            {cfg.appName}
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 12, lineHeight: 1.2 }}>
            {getHeroTitle(cfg)}
          </h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 500 }}>
            {getHeroDesc(cfg)}
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            {canViewPrimary ? (
              <Link to={`/${cfg.primary.endpoint}`} className="btn btn-primary">
                <i className={`bi bi-${cfg.primary.icon}`}></i> {cfg.primary.plural}
              </Link>
            ) : (
              <Link to={`/${cfg.secondary.endpoint}`} className="btn btn-primary">
                <i className={`bi bi-${cfg.secondary.icon}`}></i> {cfg.secondary.plural}
              </Link>
            )}
            {!user && (
              <Link to="/register" className="btn btn-secondary">
                <i className="bi bi-person-plus"></i> Регистрация
              </Link>
            )}
          </div>
        </div>
        <div style={{ fontSize: '5rem', color: 'var(--border)', display: 'flex', gap: 12, flexShrink: 0 }}>
          <i className={`bi bi-${heroIcon}`}></i>
        </div>
      </div>

      <div className={`grid ${canViewPrimary ? 'grid-2' : 'grid-1'}`} style={{ gap: 24 }}>
        {/* Recent primary */}
        {canViewPrimary && (
          <div>
            <div className="page-header" style={{ marginBottom: 14 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>
                <i className={`bi bi-${cfg.primary.icon}`} style={{ color: 'var(--accent)', marginRight: 8 }}></i>
                Последние {cfg.primary.plural.toLowerCase()}
              </h2>
              <Link to={`/${cfg.primary.endpoint}`} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
                Все <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentPrimary.map(it => (
                <Link
                  key={it.id}
                  to={`/${cfg.primary.endpoint}/${it.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <i className={`bi bi-${cfg.primary.icon}`} style={{ color: 'var(--accent)', flexShrink: 0 }}></i>
                    <span style={{ fontWeight: 500 }}>{formatPrimaryLabel(it)}</span>
                    <i className="bi bi-chevron-right" style={{ marginLeft: 'auto', color: 'var(--text-dim)' }}></i>
                  </div>
                </Link>
              ))}
              {recentPrimary.length === 0 && (
                <div style={{ color: 'var(--text-dim)', padding: '20px 0', fontSize: '0.88rem' }}>
                  Пока ничего нет.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent secondary */}
        <div>
          <div className="page-header" style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>
              <i className={`bi bi-${cfg.secondary.icon}`} style={{ color: 'var(--accent)', marginRight: 8 }}></i>
              {cfg.secondary.plural}
            </h2>
            <Link to={`/${cfg.secondary.endpoint}`} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
              Все <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentSecondary.map(it => (
              <div key={it.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <i className={`bi bi-${cfg.secondary.icon}`} style={{ color: 'var(--accent)', flexShrink: 0 }}></i>
                <span style={{ fontWeight: 500 }}>{it.name || it.title}</span>
              </div>
            ))}
            {recentSecondary.length === 0 && (
              <div style={{ color: 'var(--text-dim)', padding: '20px 0', fontSize: '0.88rem' }}>
                Пока ничего нет.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getHeroTitle(cfg) {
  const t = cfg.themeKey;
  if (t === 'game')              return 'Создавай персонажей. Исследуй игры.';
  if (t === 'streamingArtist')   return 'Делись музыкой. Собирай альбомы.';
  if (t === 'streamingPlaylist') return 'Твоя музыка. Твои плейлисты.';
  if (t === 'streamingSeries')   return 'Смотри сериалы. Следи за выходом.';
  return cfg.appName;
}

function getHeroDesc(cfg) {
  const t = cfg.themeKey;
  if (t === 'game')              return 'Создавай уникальных персонажей для своих любимых игр, назначай атрибуты и прокачивай характеристики.';
  if (t === 'streamingArtist')   return 'Исполнители создают и публикуют альбомы. Добавляй треки, подписывайся на лейблы.';
  if (t === 'streamingPlaylist') return 'Собирай плейлисты из треков, делись с другими пользователями.';
  if (t === 'streamingSeries')   return 'Каталог сериалов с сезонами и эпизодами. Добавляй в список просмотра.';
  return '';
}
