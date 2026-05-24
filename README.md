# SPA Template — 4 темы из одного кода

Шаблонное SPA приложение на React + Vite + json-server.  
Переключение темы — одна строка в `src/config.js`.

## Темы

| THEME                | Приложение  | Что создаёт пользователь | Что управляет только admin |
|----------------------|-------------|--------------------------|----------------------------|
| `game`               | GameVerse   | Персонажи                | Игры                       |
| `streamingArtist`    | SoundWave   | Альбомы + треки          | Лейблы                     |
| `streamingPlaylist`  | PlayList+   | Плейлисты                | Исполнители + треки        |
| `streamingSeries`    | SeriesHub   | Только просмотр          | Сериалы / Сезоны / Серии   |

## Запуск

```bash
npm install
npm run dev
```

Это запустит одновременно Vite (порт 5173) и Express+json-server (порт 3001).

## Смена темы

В `src/config.js` измените первую строку:

```js
const THEME = 'streamingArtist'; // game | streamingArtist | streamingPlaylist | streamingSeries
```

## Демо-аккаунты

- **admin@example.com** / `password` — администратор
- **user1@example.com** / `password` — обычный пользователь

## Структура проекта

```
src/
├── config.js              ← конфиг всех тем
├── App.jsx                ← роутер
├── main.jsx
├── index.css              ← глобальные стили
├── context/
│   └── AuthContext.jsx    ← глобальный стейт авторизации
├── hooks/
│   ├── useCrud.js         ← универсальный хук для CRUD
│   ├── useFavorites.js    ← хук для избранного
│   └── useSearch.js       ← хук поиска и фильтров
├── utils/
│   └── api.js             ← axios с JWT-интерцептором
├── components/
│   ├── navigation/
│   │   └── Navbar.jsx
│   ├── shared/
│   │   ├── EntityCard.jsx    ← универсальная карточка
│   │   ├── EntityForm.jsx    ← универсальная форма из конфига
│   │   ├── FilterBar.jsx     ← поиск + фильтры из конфига
│   │   └── ProtectedRoute.jsx
│   └── ui/
│       └── Modal.jsx
└── pages/
    ├── HomePage.jsx
    ├── PrimaryListPage.jsx    ← список главной сущности
    ├── PrimaryDetailPage.jsx  ← детальная страница
    ├── SecondaryListPage.jsx  ← список вторичной сущности
    ├── TagsPage.jsx           ← атрибуты / треки / серии
    ├── FavoritesPage.jsx
    ├── auth/
    │   ├── LoginPage.jsx
    │   └── RegisterPage.jsx
    └── admin/
        └── AdminPage.jsx
```

## Как добавить новую тему

1. Добавьте объект в `themes` в `src/config.js` по образцу существующих.
2. Добавьте начальные данные в `data.json`.
3. Всё остальное подхватится автоматически.

## Технологии

- React 18 + React Router 6
- Vite 5
- json-server (мок API)
- Express (auth endpoints — /api/auth/*)
- bcryptjs + jsonwebtoken
- Bootstrap Icons (BI)
