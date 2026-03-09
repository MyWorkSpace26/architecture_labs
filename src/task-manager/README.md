# Task Manager - Трёхзвенная архитектура

Система управления задачами, реализованная на трёхзвенной архитектуре:

- **Клиент**: React (Vite)
- **Сервер приложений**: Node.js + Express
- **База данных**: PostgreSQL

## Структура проекта

```
task-manager/
├── client/          # React клиентское приложение
├── server/          # Node.js сервер приложений
├── database/        # SQL схемы и миграции
```

## Архитектура

```
Browser
   ↓
React (Client) - порт 5173
       ↓ HTTP (JSON)
Node.js (Express API) - порт 3001
       ↓ TCP/IP
PostgreSQL - порт 5432
```

## Матрица доступа

| Операция                  | admin | moderator | viewer |
| ------------------------- | ----- | --------- | ------ |
| Просмотр задач            | ✅    | ✅        | ✅     |
| Создание задач            | ✅    | ✅        | ❌     |
| Редактирование            | ✅    | ✅        | ❌     |
| Удаление задач            | ✅    | ❌        | ❌     |
| Управление пользователями | ✅    | ❌        | ❌     |

## Структура базы данных

### users

- id (UUID)
- username (string, unique)
- email (string, unique)
- password_hash (string)
- role (admin | moderator | viewer)
- created_at (timestamp)

### tasks

- id (UUID)
- title (string)
- description (text)
- status (todo | in_progress | done)
- created_by (FK → users.id)
- created_at (timestamp)

## Безопасность

- Аутентификация через JWT (JSON Web Token)
- Пароли хранятся в виде bcrypt-хеша
- Ролевая модель доступа (RBAC - Role-Based Access Control)
- Middleware для проверки токена
- Middleware для проверки роли
- Клиент не имеет прямого доступа к базе данных

## Развертывание

### 1. Требования

- Node.js 18+
- PostgreSQL 12+
- npm или yarn

### 2. Настройка базы данных PostgreSQL

```bash
# Войдите в PostgreSQL как суперпользователь
psql -U postgres

# Создайте базу данных
CREATE DATABASE taskmanager;

# Создайте пользователя (опционально)
CREATE USER taskmanager_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE taskmanager TO taskmanager_user;

# Выйдите из psql
\q
```

### 3. Настройка сервера

```bash
# Перейдите в папку сервера
cd server

# Установите зависимости
npm install

# Настройте переменные окружения в .env
DATABASE_URL="postgresql://postgres:amin123123@localhost:5432/taskmanager?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
CLIENT_URL="http://localhost:5173"

# Сгенерируйте Prisma клиент
npm run prisma:generate

# Запустите миграции базы данных
npm run prisma:migrate

# Запустите сервер
npm run dev
```

Сервер будет доступен на http://localhost:3001

### 4. Настройка клиента

```bash
# Перейдите в папку клиента
cd client

# Установите зависимости
npm install

# Запустите клиент
npm run dev
```

Клиент будет доступен на http://localhost:5173

### 5. API документация

После запуска сервера документация доступна по адресу:
http://localhost:3001/api-docs

### 6. Тестовые пользователи

После запуска системы все пользователи регистрируются с ролью **VIEWER**.

Для создания пользователей с другими ролями:

1. Зарегистрируйте первого пользователя (он получит роль VIEWER)
2. Измените его роль на ADMIN через базу данных или специальный endpoint
3. Используйте ADMIN аккаунт для управления ролями других пользователей через `PATCH /api/users/:id/role`

**Роли пользователей:**

- **Admin**: полный доступ к системе, управление пользователями и задачами
- **Moderator**: создание и редактирование только своих задач
- **Viewer**: только просмотр задач

**Изменение ролей:**

Только пользователи с ролью ADMIN могут изменять роли других пользователей через специальный endpoint:

```bash
PATCH /api/users/:id/role
{
  "role": "ADMIN" | "MODERATOR" | "VIEWER"
}
```

# Принятые архитектурные решения

| Решение               | Причина                     |
| --------------------- | --------------------------- |
| JWT вместо session    | Stateless, масштабируемость |
| Prisma вместо raw SQL | Типобезопасность, миграции  |
| React Query           | Управление server state     |
| Context API           | Лёгкое управление auth      |
| Middleware RBAC       | Чистая архитектура          |
| UUID                  | Безопасность                |
| Swagger               | Документация API            |

---

# Поток запроса

Client
↓
CORS
↓
Helmet
↓
JSON parser
↓
Route
↓
Controller
↓
Prisma
↓
Database
