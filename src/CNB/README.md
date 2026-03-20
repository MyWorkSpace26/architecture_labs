# CNB Exchange Rate Synchronization System

Система автоматической синхронизации и отчётов по курсу чешской кроны от Чешского национального банка (ČNB).

## Архитектура

Система построена по 3-слойной архитектуре:

- **Controller Layer** - обработка HTTP запросов и API endpoints
- **Service Layer** - бизнес-логика синхронизации и расчёта статистики
- **Repository Layer** - работа с базой данных SQLite

## Функциональность

### 1. Автоматическая синхронизация

- Синхронизация курсов по расписанию (каждый день в 00:01)
- Настраиваемый список валют
- Обработка ошибок и пропусков данных

### 2. Синхронизация за период

- Загрузка данных за указанный интервал дат
- Загрузка исторических данных за год
- Устойчивость к отсутствующим данным

### 3. Web API для отчётов

- Статистические отчёты (min, max, avg, median, std dev)
- Детальные отчёты с ежедневными курсами
- Информация о доступности данных

## Установка и запуск

### 1. Установка зависимостей

```bash
npm install
```

### 2. Запуск приложения

```bash
npm start
```

### 3. Запуск в режиме разработки

```bash
npm run dev
```

Сервер запустится на `http://localhost:3000`

## API Endpoints

### Отчёты

#### Получить статистический отчёт

```
GET /report?startDate=01.01.2023&endDate=31.12.2023&currencies=USD,EUR,RUB
```

**Ответ:**

```json
{
  "success": true,
  "period": {
    "startDate": "01.01.2023",
    "endDate": "31.12.2023"
  },
  "currencies": ["USD", "EUR", "RUB"],
  "data": [
    {
      "currency": "USD",
      "min": 21.542,
      "max": 23.891,
      "avg": 22.7165,
      "median": 22.743,
      "variance": 0.456789,
      "stdDev": 0.675987,
      "dataPoints": 365
    }
  ]
}
```

#### Получить детальный отчёт

```
GET /report/detailed?startDate=01.01.2023&endDate=07.01.2023&currencies=USD
```

#### Получить доступные валюты

```
GET /report/currencies
```

#### Получить информацию о доступности данных

```
GET /report/availability
```

### Синхронизация

#### Ручная синхронизация сегодняшних данных

```
GET /sync/trigger
```

#### Синхронизация за период

```
GET /sync/period?startDate=01.01.2023&endDate=31.01.2023
```

#### Синхронизация исторических данных за год

```
GET /sync/year?year=2023
```

#### Получить статус синхронизации

```
GET /sync/status
```

### Системные

#### Проверка здоровья системы

```
GET /health
```

#### Документация API

```
GET /
```

## Конфигурация

Файл конфигурации: `src/config/config.js`

```javascript
export const config = {
  // Время синхронизации в cron формате
  syncTime: "0 1 * * *", // каждый день в 00:01

  // Список валют для синхронизации
  currencies: ["USD", "EUR", "RUB", "GBP", "CHF"],

  // Начальный год для исторических данных
  startYear: 2019,

  // Настройки сервера
  server: {
    port: 3000,
    host: "localhost",
  },
};
```

## Структура проекта

```
src/
├── config/
│   └── config.js           # Конфигурация приложения
├── controllers/
│   └── report.controller.js # Обработка HTTP запросов
├── models/
│   └── rate.model.js       # Модель данных курса валют
├── repositories/
│   └── rate.repository.js  # Работа с базой данных
├── services/
│   ├── sync.service.js     # Сервис синхронизации
│   └── report.service.js    # Сервис отчётов
├── scheduler/
│   └── sync.job.js         # Планировщик синхронизации
├── utils/
│   └── parser.js           # Парсер данных ČNB
└── app.js                   # Главный файл приложения
```

## База данных

Используется SQLite с таблицей `rates`:

```sql
CREATE TABLE rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  currency TEXT NOT NULL,
  rate REAL NOT NULL,
  amount INTEGER NOT NULL DEFAULT 1,
  UNIQUE(date, currency)
);
```

## Обработка ошибок

Система устойчива к следующим типам ошибок:

1. **Отсутствие данных** - пропускает даты без данных
2. **Некорректные значения** - игнорирует невалидные курсы
3. **Недоступность API** - повторные попытки с задержкой
4. **Ошибки базы данных** - транзакции и откат изменений

## Примеры использования

### 1. Получить отчёт по USD и EUR за 2023 год

```bash
curl "http://localhost:3000/report?startDate=01.01.2023&endDate=31.12.2023&currencies=USD,EUR"
```

### 2. Синхронизировать данные за январь 2023

```bash
curl "http://localhost:3000/sync/period?startDate=01.01.2023&endDate=31.01.2023"
```

### 3. Получить детальные курсы за последнюю неделю

```bash
curl "http://localhost:3000/report/detailed?startDate=01.01.2023&endDate=07.01.2023"
```

## Разработка

### Запуск тестов

```bash
npm test
```

### Логирование

Логирование выполняется в консоль с указанием временной метки и уровня сообщения.

## Требования

- Node.js 16+
- npm 7+
- Доступ к интернету для синхронизации с API ČNB

## Лицензия

MIT License

## ЦЕПОЧКА ВЫЗОВОВ

app.js (route)
↓
controller.triggerSync()
↓
syncService.syncToday()
↓
parser + API + DB

---

URL
↓
Controller
↓
Service
↓
Repository (DB)
↓
Service (обработка)
↓
Controller
↓
JSON ответ
