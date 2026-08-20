# Gate

Приложение-компаньон для людей, переживающих утрату близкого человека. Пользователь загружает текстовые материалы о реальном человеке (экспорт переписки, заметки), приложение строит на их основе RAG-персону и позволяет вести с ней текстовый диалог.

MVP: только текстовый чат, без фото/видео/голоса. PWA на Next.js с прицелом на упаковку в Android-приложение через TWA.

## Технологии и сервисы

| Слой | Решение |
|---|---|
| Фреймворк | Next.js (App Router), TypeScript |
| Архитектура | Feature-Sliced Design (FSD) |
| Стилизация | SCSS Modules, дизайн-токены (light/dark) |
| UI-примитивы | `react-aria-components` |
| Auth + БД | Supabase (Postgres, Auth, Storage) |
| Векторное хранилище | pgvector (расширение Postgres в Supabase) |
| ORM-слой доступа к данным | Supabase JS client + RLS |
| API | tRPC + Zod |
| Кэш на клиенте | TanStack Query (`@trpc/react-query`) |
| AI-оркестрация / стриминг | Vercel AI SDK (`ai`) |
| LLM | Groq (`openai/gpt-oss-120b` — чат и онбординг, `openai/gpt-oss-20b` — классификатор кризисных состояний) |
| Эмбеддинги | Voyage AI (`voyage-4-lite`, 1024 измерения) |
| Rate limiting | Upstash Redis (`@upstash/ratelimit`) |
| Email | Resend |
| i18n | `next-intl` (RU — основная локаль, EN — подготовлена) |
| Деплой | Vercel |

Каждый внешний провайдер (LLM, эмбеддинги) спрятан за интерфейсом в `src/shared/api/*`, чтобы смена провайдера не требовала правок в features/widgets.

## Структура проекта

```
/app          # Next.js App Router — только роутинг и API-роуты
/src
  /app        # FSD app-layer: провайдеры, глобальные стили/токены
  /views      # FSD pages-layer (переименован из-за конфликта имени с Next.js Pages Router)
  /widgets    # композиции виджетов (chat-window, consent-modal, ...)
  /features   # пользовательские действия (send-message, upload-training-file, ...)
  /entities   # доменные модели
  /shared     # ui-кит, api-клиенты, конфиг, i18n, утилиты
/supabase/migrations  # SQL-миграции, применяются вручную через Supabase SQL Editor
```

## Запуск локально

**Требования:** Node.js 22+, [pnpm](https://pnpm.io).

1. Установить зависимости:

   ```bash
   pnpm install
   ```

2. Скопировать `.env.example` в `.env.local` и заполнить значения (Supabase, Groq, Voyage, Upstash, Resend — см. секцию ниже):

   ```bash
   cp .env.example .env.local
   ```

3. Применить SQL-миграции из `supabase/migrations/` — по порядку номеров, каждую целиком, через **Supabase Dashboard → SQL Editor → New query → Run**.

4. Запустить dev-сервер:

   ```bash
   pnpm dev
   ```

   Приложение откроется на [http://localhost:3000](http://localhost:3000).

Прочие команды:

```bash
pnpm build   # production-сборка
pnpm start   # запуск production-сборки
pnpm lint    # ESLint
```

## Переменные окружения

Полный список — в [.env.example](.env.example). Кратко, откуда брать:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase Dashboard → Project Settings → API.
- `GROQ_API_KEY` — [console.groq.com](https://console.groq.com) → API Keys.
- `EMBEDDINGS_API_KEY` — [dashboard.voyageai.com](https://dashboard.voyageai.com) → API Keys.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — [console.upstash.com](https://console.upstash.com), Redis-база → REST API.
- `RESEND_API_KEY` — [resend.com](https://resend.com) → API Keys.
- `SUPPORT_EMAIL` — адрес, куда форма обратной связи присылает письма.
- `QSTASH_TOKEN` — зарезервировано под фоновую обработку больших файлов, в MVP не используется (обработка идёт синхронно).

## Деплой

Приложение рассчитано на Vercel без дополнительной инфраструктуры — прописать те же переменные окружения в настройках проекта Vercel и задеплоить из этого репозитория.
