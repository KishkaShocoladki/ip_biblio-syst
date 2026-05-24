import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_CONFIG } from '../../config';

export function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error,  setError]      = useState('');
  const [loading,setLoading]    = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch (err) { setError(err.response?.data?.error || 'Ошибка входа'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-title">{APP_CONFIG.appName}</div>
        <div className="auth-subtitle">Войдите в систему</div>
        {error && <div className="alert alert-error"><i className="bi bi-exclamation-triangle"></i> {error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <><span className="spinner"></span> Вход...</> : 'Войти'}
          </button>
        </form>
        <div className="auth-switch">Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></div>
        <div className="alert alert-info" style={{ marginTop: 18, fontSize: '.79rem' }}>
          <i className="bi bi-info-circle"></i>
          Демо: admin@example.com / password · ivanov@example.com / password
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]     = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError]   = useState('');
  const [loading,setLoading]= useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Пароли не совпадают'); return; }
    setError(''); setLoading(true);
    try { await register(form.username, form.email, form.password); navigate('/'); }
    catch (err) { setError(err.response?.data?.error || 'Ошибка'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-title">{APP_CONFIG.appName}</div>
        <div className="auth-subtitle">Создайте аккаунт</div>
        {error && <div className="alert alert-error"><i className="bi bi-exclamation-triangle"></i> {error}</div>}
        <form onSubmit={submit}>
          {[
            { k: 'username', l: 'Имя пользователя', t: 'text' },
            { k: 'email',    l: 'Email',             t: 'email' },
            { k: 'password', l: 'Пароль',            t: 'password' },
            { k: 'confirm',  l: 'Подтвердите пароль',t: 'password' },
          ].map(f => (
            <div className="form-group" key={f.k}>
              <label className="form-label">{f.l}</label>
              <input type={f.t} className="form-control" value={form[f.k]} onChange={e => set(f.k, e.target.value)} required />
            </div>
          ))}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <><span className="spinner"></span> Регистрация...</> : 'Зарегистрироваться'}
          </button>
        </form>
        <div className="auth-switch">Уже есть аккаунт? <Link to="/login">Войти</Link></div>
      </div>
    </div>
  );
}
