import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readFileSync, writeFileSync } from 'fs';
import jsonServer from 'json-server';

const JWT_SECRET = 'spa2-secret-2024';
const PORT = 3001;
const DATA_FILE = './data.json';

const app = express();
app.use(cors());
app.use(express.json());

function getData()      { return JSON.parse(readFileSync(DATA_FILE, 'utf-8')); }
function saveData(data) { writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

// ── Auth ─────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: 'Все поля обязательны' });

  const data = getData();
  if (data.users.find(u => u.email === email || u.username === username))
    return res.status(400).json({ error: 'Пользователь уже существует' });

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: Date.now(),
    username,
    email,
    passwordHash,
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  data.users.push(newUser);
  saveData(data);

  const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...user } = newUser;
  res.json({ token, user });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const data = getData();
  const user = data.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Неверный email или пароль' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Неверный email или пароль' });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

app.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Нет токена' });
  try {
    const payload = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    const data = getData();
    const user = data.users.find(u => u.id === payload.id);
    if (!user) return res.status(404).json({ error: 'Не найден' });
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch {
    res.status(401).json({ error: 'Токен недействителен' });
  }
});

// ── Files CRUD for access theme ─────────────────────────────────
app.get('/api/files', (req, res) => {
  const data = getData();
  res.json(data.files || []);
});

app.get('/api/files/:id', (req, res) => {
  const data = getData();
  const file = (data.files || []).find(item => String(item.id) === String(req.params.id));
  if (!file) return res.status(404).json({ error: 'Файл не найден' });
  res.json(file);
});

app.post('/api/files', (req, res) => {
  const data = getData();
  const files = data.files || [];
  const newFile = { id: Date.now(), ...req.body };
  data.files = [...files, newFile];
  saveData(data);
  res.status(201).json(newFile);
});

app.put('/api/files/:id', (req, res) => {
  const data = getData();
  const files = data.files || [];
  const index = files.findIndex(item => String(item.id) === String(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Файл не найден' });
  const updated = { ...files[index], ...req.body };
  data.files[index] = updated;
  saveData(data);
  res.json(updated);
});

app.delete('/api/files/:id', (req, res) => {
  const data = getData();
  const files = data.files || [];
  if (!files.some(item => String(item.id) === String(req.params.id))) {
    return res.status(404).json({ error: 'Файл не найден' });
  }
  data.files = files.filter(item => String(item.id) !== String(req.params.id));
  saveData(data);
  res.status(204).end();
});

// ── JSON-server ───────────────────────────────────────────────
const router      = jsonServer.router(DATA_FILE);
const middlewares = jsonServer.defaults({ noCors: true });
app.use(middlewares);
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});
