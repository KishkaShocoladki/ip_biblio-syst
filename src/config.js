// ============================================================
// КОНФИГ ШАБЛОНА — меняй только здесь для другой темы
// ============================================================
//
// Активная тема: THEME
// Доступные темы:
//   'library'    — Библиотека: посетители, книги, выдачи
//   'access'     — Контроль доступа: сотрудники, помещения, события
//   'vcs'        — Контроль версий: проекты, пользователи, milestones, issues

const THEME = 'vcs';

// ============================================================

const themes = {

  // ----------------------------------------------------------
  // Тема 8: Библиотека
  //
  // Сущности: Посетитель, Книга, Выдача, Категория (справочник)
  //
  // Посетитель = пользователь системы (регистрируется сам).
  // Книги crud-ит только библиотекарь (admin).
  // Выдача создаётся библиотекарем: книга → посетитель.
  // Категории — справочник, admin.
  //
  // Связи:
  //   Книга -[many]-> Категория  (одна книга, одна категория)
  //   Выдача -[one]-> Книга
  //   Выдача -[one]-> Посетитель
  // ----------------------------------------------------------
  library: {
    appName: 'LibraryMS',
    themeKey: 'library',

    // Кто что может:
    //   admin  — полный CRUD книг, категорий, выдач
    //   user   — просмотр книг, своих выдач
    userCanCreate: false,   // обычный пользователь не создаёт primary (выдачи)

    user: { singular: 'Посетитель', plural: 'Посетители' },

    // primary = главная рабочая сущность (Выдача)
    primary: {
      singular: 'Выдача',
      plural: 'Выдачи',
      endpoint: 'loans',
      icon: 'arrow-left-right',
      adminOnly: true,   // создавать/редактировать может только admin
    },

    // secondary = справочник (Книга)
    secondary: {
      singular: 'Книга',
      plural: 'Книги',
      endpoint: 'books',
      icon: 'book',
      adminOnly: true,
    },

    // tag = классификатор (Категория книги)
    tag: {
      singular: 'Категория',
      plural: 'Категории',
      endpoint: 'categories',
      icon: 'tag',
      adminOnly: true,
    },

    favorites: { enabled: false },

    // ── Поля выдачи ────────────────────────────────────────
    primaryFields: {
      book:       { key: 'bookId',      label: 'Книга',            type: 'select',         required: true,  refEndpoint: 'books' },
      visitor:    { key: 'visitorId',   label: 'Посетитель',       type: 'select',         required: true,  refEndpoint: 'users' },
      issuedAt:   { key: 'issuedAt',    label: 'Дата выдачи',      type: 'date',           required: true },
      returnBy:   { key: 'returnBy',    label: 'Вернуть до',       type: 'date',           required: true },
      returnedAt: { key: 'returnedAt',  label: 'Дата возврата',    type: 'date',           required: false },
      status:     { key: 'status',      label: 'Статус',           type: 'select-static',  required: true,
        options: [
          { value: 'active',    label: 'На руках' },
          { value: 'returned',  label: 'Возвращена' },
          { value: 'overdue',   label: 'Просрочена' },
        ],
      },
      notes: { key: 'notes', label: 'Примечания', type: 'textarea', required: false },
    },

    // ── Поля книги ─────────────────────────────────────────
    secondaryFields: {
      title:      { key: 'title',       label: 'Название',         type: 'text',     required: true },
      author:     { key: 'author',      label: 'Автор',            type: 'text',     required: true },
      isbn:       { key: 'isbn',        label: 'ISBN',             type: 'text',     required: false },
      category:   { key: 'categoryId',  label: 'Категория',        type: 'select',   required: false, refEndpoint: 'categories' },
      year:       { key: 'year',        label: 'Год издания',      type: 'number',   required: false },
      copies:     { key: 'copies',      label: 'Экземпляров',      type: 'number',   required: false },
      description:{ key: 'description', label: 'Аннотация',        type: 'textarea', required: false },
      cover:      { key: 'cover',       label: 'Обложка (URL)',    type: 'text',     required: false },
    },

    // ── Поля категории ─────────────────────────────────────
    tagFields: {
      name:  { key: 'name',  label: 'Название', type: 'text',  required: true },
      color: { key: 'color', label: 'Цвет',     type: 'color', required: false },
    },

    // Фильтры для primary (выдач)
    filters: [
      { key: 'status',     label: 'Статус',     type: 'select-static', options: [
          { value: 'active',   label: 'На руках' },
          { value: 'returned', label: 'Возвращена' },
          { value: 'overdue',  label: 'Просрочена' },
        ],
      },
      { key: 'bookId',     label: 'Книга',      refEndpoint: 'books' },
    ],

    // Что показывать на карточке primary (выдачи)
    primaryCard: {
      titleRef:    { key: 'bookId',    refEndpoint: 'books',      refLabel: 'title' },
      subtitleRef: { key: 'visitorId', refEndpoint: 'users',      refLabel: 'username' },
      statusKey:   'status',
      dateKeys:    ['issuedAt', 'returnBy', 'returnedAt'],
      imageKey:    null,
      statsKeys:   [],
    },

    // Что показывать на карточке secondary (книги)
    secondaryCard: {
      titleKey:   'title',
      subtitleKey: 'author',
      descKey:    'description',
      imageKey:   'cover',
      metaKey:    'year',
      refKey:     { key: 'categoryId', refEndpoint: 'categories', refLabel: 'name' },
    },
  },

  // ----------------------------------------------------------
  // Тема 12: Система контроля доступа
  //
  // Сущности: Сотрудник (=пользователь), Файл, Сессия (вход/выход)
  //
  // Сотрудник регистрируется сам.
  // Файлы crud-ит только admin.
  // Сессии фиксируются админом, обычный пользователь видит только файлы.
  // Роль в этой теме отключена.
  //
  // Связи:
  //   Сессия -[one]-> Сотрудник
  // ----------------------------------------------------------
  access: {
    appName: 'AccessControl',
    themeKey: 'access',

    userCanCreate: false,

    user: { singular: 'Сотрудник', plural: 'Сотрудники' },

    primary: {
      singular: 'Сессия',
      plural: 'Сессии',
      endpoint: 'events',
      icon: 'clock-history',
      adminOnly: true,
    },

    secondary: {
      singular: 'Файл',
      plural: 'Файлы',
      endpoint: 'files',
      icon: 'file-earmark',
      adminOnly: true,
    },

    tag: null,

    favorites: { enabled: false },

    // ── Поля сессии ───────────────────────────────────────
    primaryFields: {
      employee:  { key: 'employeeId', label: 'Сотрудник', type: 'select',        required: true, refEndpoint: 'users' },
      type:      { key: 'type',       label: 'Тип',        type: 'select-static', required: true,
        options: [
          { value: 'enter', label: 'Вход' },
          { value: 'exit',  label: 'Выход' },
          { value: 'denied',label: 'Отказ' },
        ],
      },
      timestamp: { key: 'timestamp', label: 'Дата и время', type: 'datetime-local', required: true },
      notes:     { key: 'notes',     label: 'Примечания',  type: 'textarea',       required: false },
    },

    // ── Поля файла ───────────────────────────────────────
    secondaryFields: {
      name:        { key: 'name',        label: 'Название',       type: 'text',     required: true },
      path:        { key: 'path',        label: 'Путь / URL',     type: 'text',     required: true },
      type:        { key: 'type',        label: 'Тип файла',      type: 'select-static', required: false,
        options: [
          { value: 'pdf',  label: 'PDF' },
          { value: 'docx', label: 'DOCX' },
          { value: 'xlsx', label: 'XLSX' },
          { value: 'txt',  label: 'TXT' },
        ],
      },
      size:        { key: 'size',        label: 'Размер',         type: 'text',     required: false },
      description: { key: 'description', label: 'Описание',       type: 'textarea', required: false },
    },

    filters: [
      { key: 'type',   label: 'Тип', type: 'select-static', options: [
          { value: 'enter',  label: 'Вход' },
          { value: 'exit',   label: 'Выход' },
          { value: 'denied', label: 'Отказ' },
        ],
      },
    ],

    primaryCard: {
      titleRef:    { key: 'employeeId', refEndpoint: 'users', refLabel: 'username' },
      subtitleKey: 'type',
      statusKey:   'type',
      dateKeys:    ['timestamp'],
      imageKey:    null,
      statsKeys:   [],
    },

    secondaryCard: {
      titleKey:    'name',
      subtitleKey: 'path',
      descKey:     'description',
      imageKey:    null,
      metaKey:     'type',
      refKey:      null,
    },
  },

  // ----------------------------------------------------------
  // Тема 14/15: Система контроля версий
  //
  // Сущности: Пользователь, Проект, Milestone, Issue (задача)
  //
  // Пользователь регистрируется сам.
  // Проект создаёт любой авторизованный пользователь (владелец).
  // Milestone создаёт владелец проекта или admin.
  // Issue создаёт любой участник.
  //
  // Связи:
  //   Проект -[many]-> Участники (users)
  //   Milestone -[one]-> Проект
  //   Issue -[one]-> Проект
  //   Issue -[one]-> Milestone (необязательно)
  //   Issue -[one]-> Исполнитель (user)
  // ----------------------------------------------------------
  vcs: {
    appName: 'TrackFlow',
    themeKey: 'vcs',

    userCanCreate: true,   // пользователь создаёт проекты

    user: { singular: 'Пользователь', plural: 'Пользователи' },

    primary: {
      singular: 'Проект',
      plural: 'Проекты',
      endpoint: 'projects',
      icon: 'folder2-open',
      adminOnly: false,
    },

    secondary: {
      singular: 'Milestone',
      plural: 'Milestones',
      endpoint: 'milestones',
      icon: 'flag',
      adminOnly: false,
    },

    tag: {
      singular: 'Issue',
      plural: 'Issues',
      endpoint: 'issues',
      icon: 'bug',
      adminOnly: false,
    },

    favorites: { enabled: true, label: 'Избранные проекты', endpoint: 'favorites' },

    // ── Поля проекта ───────────────────────────────────────
    primaryFields: {
      name:        { key: 'name',        label: 'Название',       type: 'text',           required: true },
      description: { key: 'description', label: 'Описание',       type: 'textarea',       required: false },
      visibility:  { key: 'visibility',  label: 'Видимость',      type: 'select-static',  required: false,
        options: [
          { value: 'public',  label: 'Публичный' },
          { value: 'private', label: 'Приватный' },
        ],
      },
      status: { key: 'status', label: 'Статус', type: 'select-static', required: false,
        options: [
          { value: 'active',   label: 'Активный' },
          { value: 'archived', label: 'Архив' },
          { value: 'paused',   label: 'Пауза' },
        ],
      },
      language: { key: 'language', label: 'Язык',     type: 'text', required: false },
      stars:    { key: 'stars',    label: 'Звёзды',   type: 'number', required: false },
    },

    // ── Поля milestone ─────────────────────────────────────
    secondaryFields: {
      title:       { key: 'title',       label: 'Название',       type: 'text',           required: true },
      projectId:   { key: 'projectId',   label: 'Проект',         type: 'select',         required: true, refEndpoint: 'projects' },
      description: { key: 'description', label: 'Описание',       type: 'textarea',       required: false },
      dueDate:     { key: 'dueDate',     label: 'Дедлайн',        type: 'date',           required: false },
      status:      { key: 'status',      label: 'Статус',         type: 'select-static',  required: false,
        options: [
          { value: 'open',   label: 'Открыт' },
          { value: 'closed', label: 'Закрыт' },
        ],
      },
    },

    // ── Поля issue ─────────────────────────────────────────
    tagFields: {
      title:       { key: 'title',       label: 'Заголовок',      type: 'text',           required: true },
      projectId:   { key: 'projectId',   label: 'Проект',         type: 'select',         required: true, refEndpoint: 'projects' },
      milestoneId: { key: 'milestoneId', label: 'Milestone',      type: 'select',         required: false, refEndpoint: 'milestones' },
      assigneeId:  { key: 'assigneeId',  label: 'Исполнитель',    type: 'select',         required: false, refEndpoint: 'users' },
      type:        { key: 'type',        label: 'Тип',            type: 'select-static',  required: false,
        options: [
          { value: 'bug',     label: 'Bug' },
          { value: 'feature', label: 'Feature' },
          { value: 'task',    label: 'Task' },
          { value: 'docs',    label: 'Docs' },
        ],
      },
      priority:    { key: 'priority',    label: 'Приоритет',      type: 'select-static',  required: false,
        options: [
          { value: 'low',      label: 'Низкий' },
          { value: 'medium',   label: 'Средний' },
          { value: 'high',     label: 'Высокий' },
          { value: 'critical', label: 'Критический' },
        ],
      },
      status:      { key: 'status',      label: 'Статус',         type: 'select-static',  required: false,
        options: [
          { value: 'open',        label: 'Открыт' },
          { value: 'in_progress', label: 'В работе' },
          { value: 'review',      label: 'На ревью' },
          { value: 'closed',      label: 'Закрыт' },
        ],
      },
      description: { key: 'description', label: 'Описание',       type: 'textarea',       required: false },
    },

    filters: [
      { key: 'status',     label: 'Статус',    type: 'select-static', options: [
          { value: 'active',   label: 'Активный' },
          { value: 'archived', label: 'Архив' },
          { value: 'paused',   label: 'Пауза' },
        ],
      },
      { key: 'visibility', label: 'Видимость', type: 'select-static', options: [
          { value: 'public',  label: 'Публичный' },
          { value: 'private', label: 'Приватный' },
        ],
      },
    ],

    primaryCard: {
      titleKey:    'name',
      subtitleKey: 'language',
      descKey:     'description',
      statusKey:   'status',
      imageKey:    null,
      statsKeys:   ['stars'],
      tagsKey:     null,
    },

    secondaryCard: {
      titleKey:    'title',
      subtitleRef: { key: 'projectId', refEndpoint: 'projects', refLabel: 'name' },
      descKey:     'description',
      imageKey:    null,
      metaKey:     'dueDate',
      refKey:      null,
    },
  },
};

export const APP_CONFIG = themes[THEME];
export const CURRENT_THEME = THEME;
