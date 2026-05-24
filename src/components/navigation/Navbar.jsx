import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_CONFIG } from '../../config';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const cfg = APP_CONFIG;

  const links = [
    { to: '/',                       label: 'Главная',            icon: 'house' },
    ...(!(cfg.themeKey === 'access' && cfg.primary.adminOnly && !isAdmin) ? [{ to: `/${cfg.primary.endpoint}`,  label: cfg.primary.plural,   icon: cfg.primary.icon }] : []),
    { to: `/${cfg.secondary.endpoint}`,label: cfg.secondary.plural, icon: cfg.secondary.icon },
    ...(cfg.tag && (!cfg.tag.adminOnly || isAdmin) ? [{ to: '/tags', label: cfg.tag.plural, icon: cfg.tag.icon }] : []),
    ...(user && cfg.favorites?.enabled
      ? [{ to: '/favorites', label: cfg.favorites.label, icon: 'heart' }]
      : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Управление', icon: 'gear' }] : []),
  ];

  return (
    <>
      {isAdmin && (
        <div className="admin-bar">
          <i className="bi bi-shield-check"></i> Режим администратора
        </div>
      )}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="nav-brand">{cfg.appName}</Link>

          <div className={`nav-links${open ? ' open' : ''}`}>
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <i className={`bi bi-${l.icon}`}></i> {l.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-right">
            {user ? (
              <>
                <span className="nav-user">
                  <i className="bi bi-person"></i> {user.username}
                  {user.role === 'admin' && <span className="badge badge-admin" style={{ marginLeft: 4 }}>admin</span>}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={logout}>
                  <i className="bi bi-box-arrow-right"></i>
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login"    className="btn btn-ghost btn-sm">Войти</NavLink>
                <NavLink to="/register" className="btn btn-primary btn-sm">Регистрация</NavLink>
              </>
            )}
          </div>

          <button className="nav-burger btn btn-ghost" onClick={() => setOpen(o => !o)}>
            <i className={`bi bi-${open ? 'x' : 'list'}`}></i>
          </button>
        </div>
      </nav>
    </>
  );
}
