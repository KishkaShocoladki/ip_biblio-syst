import { Routes, Route } from 'react-router-dom';
import { APP_CONFIG } from './config';
import Navbar from './components/navigation/Navbar';

import HomePage          from './pages/HomePage';
import LoginPage         from './pages/auth/LoginPage';
import RegisterPage      from './pages/auth/RegisterPage';
import PrimaryListPage   from './pages/PrimaryListPage';
import PrimaryDetailPage from './pages/PrimaryDetailPage';
import SecondaryListPage from './pages/SecondaryListPage';
import SecondaryDetailPage from './pages/SecondaryDetailPage';
import TagsPage          from './pages/TagsPage';
import FavoritesPage     from './pages/FavoritesPage';
import AdminPage         from './pages/admin/AdminPage';

import { RequireAuth, RequireAdmin } from './components/shared/ProtectedRoute';

const cfg = APP_CONFIG;

export default function App() {
  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/"       element={<HomePage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Primary entity */}
          <Route path={`/${cfg.primary.endpoint}`}     element={<PrimaryListPage />} />
          <Route path={`/${cfg.primary.endpoint}/:id`} element={<PrimaryDetailPage />} />

          {/* Secondary entity */}
          <Route path={`/${cfg.secondary.endpoint}`}   element={<SecondaryListPage />} />
          <Route path={`/${cfg.secondary.endpoint}/:id`} element={<SecondaryDetailPage />} />

          {/* Tags / Attributes */}
          {cfg.tag && (
            <Route path="/tags" element={<TagsPage />} />
          )}

          {/* Favorites */}
          {cfg.favorites?.enabled && (
            <Route path="/favorites" element={
              <RequireAuth><FavoritesPage /></RequireAuth>
            } />
          )}

          {/* Admin */}
          <Route path="/admin" element={
            <RequireAdmin><AdminPage /></RequireAdmin>
          } />

          {/* 404 */}
          <Route path="*" element={
            <div className="empty-state" style={{ marginTop: 60 }}>
              <i className="bi bi-question-circle" style={{ fontSize: '2.5rem' }}></i>
              <p>Страница не найдена.</p>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}
