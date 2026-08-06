# Деплой Nikssens через Docker + Dokploy

Репозитории раздельные:

| Сервис | GitHub | Папка | Порт в контейнере |
|--------|--------|-------|-------------------|
| Frontend (Vite) | `Denzel9/project` | `nikssens/` | `80` |
| Backend (Nest) | `Denzel9/project-back` | `project-back/` | `3010` |
| Corporate (Next) | `Denzel9/nikssens-corporate` | `corporate/` | `3011` |
| Postgres | Dokploy Database / Compose | — | `5432` |

В каждом проекте уже есть `Dockerfile` (не Nixpacks).

---

## 0. Подготовка доменов

Пример:

- `app.nikssens.com` → frontend
- `api.nikssens.com` → backend
- `nikssens.com` / `www` → corporate
- DNS A-записи на IP VPS

---

## 1. Postgres в Dokploy

1. Dokploy → **Databases** → Create **PostgreSQL**.
2. Сохраните `DATABASE_URL`.
3. Для backend используйте internal host Dokploy (не `localhost`).

---

## 2. Backend (`project-back`)

1. Build type: **Dockerfile**, port **3010**.
2. Env из `.env.example` (`DATABASE_URL`, `CORS_ORIGIN`, `FRONTEND_URL`, JWT, cookies).
3. Domain → `api.…`, HTTPS.
4. При старте: `prisma migrate deploy`.

---

## 3. Frontend (`project`)

1. Build type: **Dockerfile**, port **80**.
2. **Build arg** `VITE_API_URL_BACKEND=https://api.…` (обязательно).
3. **Build arg** `VITE_HELP_URL=https://help.…` (опционально, база знаний).
4. Domain → `app.…`, HTTPS.

---

## 4. Corporate

1. Build type: **Dockerfile**, port **3011**.
2. Build arg `NEXT_PUBLIC_PLATFORM_URL=https://app.…`.

---

## Порядок

Postgres → Backend → Frontend → Corporate.

Полная инструкция: см. `DEPLOY.md` в корне локального workspace или этот файл.
