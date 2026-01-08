# IDS Assessment Platform - Backend

Backend API для IDS Assessment Platform на NestJS + Prisma + PostgreSQL.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

Создайте файл `.env` в корне backend папки:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ids_assessment?schema=public"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Замените** `password` на ваш пароль от PostgreSQL!

### 3. Создайте базу данных

В PostgreSQL:

```sql
CREATE DATABASE ids_assessment;
```

Или через psql:

```bash
psql -U postgres
CREATE DATABASE ids_assessment;
\q
```

### 4. Запустите миграции Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Заполните базу тестовыми данными (опционально)

```bash
npm run prisma:seed
```

### 6. Запустите backend

```bash
npm run start:dev
```

Backend запустится на `http://localhost:3001`

---

## 📚 API Endpoints

### Health Check

```
GET /api
GET /api/health
```

### Attack Scenarios

```
GET    /api/scenarios          - Получить все сценарии
GET    /api/scenarios?status=ready  - Фильтр по статусу
GET    /api/scenarios/:id      - Получить один сценарий
POST   /api/scenarios          - Создать сценарий
PUT    /api/scenarios/:id      - Обновить сценарий
DELETE /api/scenarios/:id      - Удалить сценарий
POST   /api/scenarios/:id/run  - Запустить тест
```

**Пример создания сценария:**

```json
{
  "name": "EternalBlue Test",
  "description": "SMB exploit test",
  "exploitType": "Remote Code Execution",
  "targetIP": "192.168.1.100",
  "targetOS": "Windows Server 2008 R2",
  "targetPort": 445,
  "status": "ready"
}
```

### Tests

```
GET /api/tests           - Получить все тесты
GET /api/tests/:id       - Получить один тест
GET /api/tests/:id/results  - Получить результаты теста
```

### Dashboard

```
GET /api/dashboard/stats - Получить статистику для dashboard
```

**Пример ответа:**

```json
{
  "totalTests": 47,
  "activeTests": 2,
  "totalAttacks": 2847,
  "detectedAttacks": 2654,
  "detectionRate": 93.2,
  "falsePositiveRate": 2.1,
  "avgDetectionTime": 1247
}
```

### Lab Monitor

```
GET /api/lab/environments  - Получить lab environments
GET /api/lab/ids-configs   - Получить IDS конфигурации
```

### Reports

```
GET  /api/reports          - Получить все отчёты
POST /api/reports/generate - Сгенерировать отчёт
```

**Пример генерации отчёта:**

```json
{
  "name": "January 2025 Report",
  "type": "summary",
  "format": "pdf",
  "dateRange": "30"
}
```

---

## 🗄️ База данных (Prisma Schema)

### Модели:

- **AttackScenario** - сценарии атак
- **Test** - тесты
- **TestResult** - результаты тестов
- **IDSConfiguration** - конфигурации IDS
- **LabEnvironment** - виртуальные машины
- **Report** - отчёты

### Prisma команды:

```bash
npm run prisma:generate  # Сгенерировать Prisma Client
npm run prisma:migrate   # Создать миграцию
npm run prisma:studio    # Открыть Prisma Studio
npm run prisma:seed      # Заполнить базу данными
npm run prisma:reset     # Сбросить базу
```

---

## 🧪 Тестирование API

### Через curl:

```bash
# Health check
curl http://localhost:3001/api/health

# Получить все сценарии
curl http://localhost:3001/api/scenarios

# Создать сценарий
curl -X POST http://localhost:3001/api/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Scenario",
    "description": "Test",
    "exploitType": "RCE",
    "targetIP": "192.168.1.100",
    "targetOS": "Windows",
    "targetPort": 445
  }'

# Запустить тест
curl -X POST http://localhost:3001/api/scenarios/SCENARIO_ID/run

# Dashboard stats
curl http://localhost:3001/api/dashboard/stats
```

### Через Postman/Thunder Client:

Импортируйте endpoints из списка выше.

---

## 🔄 Как работает симуляция тестов

Когда вы запускаете `POST /api/scenarios/:id/run`:

1. Создаётся новый Test со статусом `running`
2. Scenario переходит в статус `running`
3. Через 5 секунд симулируется завершение теста:
   - Генерируются TestResults (20-50 атак)
   - 85-95% атак помечаются как detected
   - Добавляются случайные false positives
4. Test переходит в статус `completed`
5. Scenario переходит в статус `completed`

**В реальном приложении** здесь бы запускался Metasploit через RPC API.

---

## 📁 Структура проекта

```
backend/
├── src/
│   ├── main.ts              # Точка входа
│   ├── app.module.ts        # Главный модуль
│   ├── app.controller.ts    # Главный контроллер
│   ├── app.service.ts       # Главный сервис
│   │
│   ├── prisma/              # Prisma модуль
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── scenarios/           # Attack Scenarios
│   │   ├── scenarios.module.ts
│   │   ├── scenarios.controller.ts
│   │   ├── scenarios.service.ts
│   │   └── dto/
│   │       └── scenario.dto.ts
│   │
│   ├── tests/               # Tests
│   │   ├── tests.module.ts
│   │   ├── tests.controller.ts
│   │   └── tests.service.ts
│   │
│   ├── dashboard/           # Dashboard Stats
│   │   ├── dashboard.module.ts
│   │   ├── dashboard.controller.ts
│   │   └── dashboard.service.ts
│   │
│   ├── lab/                 # Lab Monitor
│   │   ├── lab.module.ts
│   │   ├── lab.controller.ts
│   │   └── lab.service.ts
│   │
│   └── reports/             # Reports
│       ├── reports.module.ts
│       ├── reports.controller.ts
│       ├── reports.service.ts
│       └── dto/
│           └── report.dto.ts
│
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed данные
│
├── .env                     # Environment variables
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## 🔗 Подключение Frontend

В frontend создайте файл `src/services/api.ts`:

```typescript
const API_URL = 'http://localhost:3001/api';

export const api = {
  // Scenarios
  getScenarios: () => fetch(`${API_URL}/scenarios`).then(r => r.json()),
  createScenario: (data) => fetch(`${API_URL}/scenarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json()),
  runScenario: (id) => fetch(`${API_URL}/scenarios/${id}/run`, {
    method: 'POST',
  }).then(r => r.json()),
  
  // Tests
  getTests: () => fetch(`${API_URL}/tests`).then(r => r.json()),
  
  // Dashboard
  getDashboardStats: () => fetch(`${API_URL}/dashboard/stats`).then(r => r.json()),
  
  // Lab
  getLabEnvironments: () => fetch(`${API_URL}/lab/environments`).then(r => r.json()),
  getIDSConfigs: () => fetch(`${API_URL}/lab/ids-configs`).then(r => r.json()),
  
  // Reports
  getReports: () => fetch(`${API_URL}/reports`).then(r => r.json()),
  generateReport: (data) => fetch(`${API_URL}/reports/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json()),
};
```

---

## 🛠️ Troubleshooting

### Ошибка подключения к базе данных

```
Error: Can't reach database server
```

**Решение:**
1. Убедитесь что PostgreSQL запущен
2. Проверьте DATABASE_URL в `.env`
3. Проверьте что база `ids_assessment` создана

### Prisma Client не найден

```
Error: @prisma/client did not initialize yet
```

**Решение:**

```bash
npm run prisma:generate
```

### Порт 3001 занят

**Решение:** Измените PORT в `.env` файле:

```env
PORT=3002
```

---

## 📊 Prisma Studio

Откройте visual редактор базы данных:

```bash
npm run prisma:studio
```

Откроется на `http://localhost:5555`

---

## 🎯 Следующие шаги

1. ✅ Backend работает
2. ⏳ Подключите Frontend к Backend API
3. ⏳ Замените mock данные на реальные API вызовы
4. ⏳ (Опционально) Добавьте WebSocket для real-time
5. ⏳ (Опционально) Интегрируйте с реальным Metasploit

---

**Backend готов к использованию!** 🚀