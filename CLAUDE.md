@AGENTS.md

# Gate — контекст проекта для Claude

Этот раздел — не автогенерируемый (в отличие от `AGENTS.md` выше), это ручная
документация проекта и договорённостей по стилю работы. Обновляй её, когда
меняется архитектура или появляются новые устойчивые договорённости — не жди
следующего запроса "сохрани контекст".

## Что такое Gate

PWA-приложение-компаньон для переживающих утрату близкого человека. Пользователь
загружает переписку/заметки о человеке, приложение создаёт его "персону"
(RAG-чат-бот в характере этого человека) и предлагает договорить несказанное.
Дисклеймер о том, что это не замена живому общению/психологу, встроен в согласия
при регистрации, в лендинг и в промпт персоны.

**Прод:** https://gate-flame.vercel.app
**GitHub:** github.com/111398/gate (Git user: Sergey Smirnov)
**Vercel:** проект `111398s-projects/gate` (id `prj_C4ytjaf2DszMwCMMyDWoV4lw6CWK`),
автодеплой на пуш в `main`
**Supabase:** отдельный проект, URL/ключи — в `.env.local` (не в репозитории)

## Стек

- Next.js 16 (App Router, Turbopack), React 19
- FSD-архитектура: `app/ → src/{views,widgets,features,entities,shared}`
- Supabase: Auth (email/password, PKCE), Postgres (+ pgvector), Storage, RLS на всех таблицах
- tRPC + Zod + TanStack Query — весь CRUD, кроме чата
- Vercel AI SDK (`ai` v7, `ToolLoopAgent`, `createAgentUIStreamResponse`) поверх
  Groq (`@ai-sdk/groq`) — единственный streaming-эндпоинт вне tRPC: `app/api/chat/route.ts`
- Voyage AI (`voyage-4-lite`) — эмбеддинги для RAG, напрямую через fetch (без AI SDK)
- next-intl — ru/en, без `[locale]`-роутинга (см. ниже)
- react-aria-components — все интерактивные примитивы в `src/shared/ui`
- SCSS-модули на CSS-токенах (`src/app/styles/_tokens.scss`), без Tailwind

## Архитектурные решения, которые нужно помнить

**Postgres-триггеры как источник истины для запретов.** Domain-валидация
(`.ru`-почта) и валидация согласий при регистрации сделаны `before insert on
auth.users` триггерами, которые кидают исключение — это защищает и от сырых
запросов в обход формы, не только от UI-валидации. `after insert on auth.users`
(`handle_new_user()`) создаёт `public.users` + связанные строки (согласия и т.п.).
Паттерн уже использован дважды (`0001_init.sql` — домен, `0005_consents_at_registration.sql`
— согласия) — переиспользуй его для любой новой "нельзя создать аккаунт без X".

**`messages.phase` разделяет онбординг от основного чата.** Колонка
`phase: 'onboarding' | 'main'` (`0006_message_phase.sql`). `trpc.messages.getHistory`
фильтрует `phase='main'` — онбординг и supplement-сессии ("Дополнить данные о
персоне" из настроек) пишут `phase='onboarding'` и не видны в основном чате.
Оба режима определяются в `app/api/chat/route.ts` по `persona.status ===
'onboarding'` и по флагу `body.trainingMode === true` из `widgets/training-chat`.

**Локаль — через cookie, не через URL.** `src/shared/config/i18n.ts`
(`LOCALE_COOKIE`, `pickDefaultLocale`), `proxy.ts` проставляет cookie при первом
визите по `Accept-Language` (ru → ru, всё остальное → en), `src/shared/i18n/request.ts`
читает её. Переключатель (`features/switch-locale`) — server action + `router.refresh()`,
с блокирующим оверлеем на время перехода (`useTransition`, React 19 async transition).

**Тема — через `data-theme` на `<html>`, не `prefers-color-scheme`.** Дефолт
всегда светлая, независимо от ОС. `app/layout.tsx` ставит тему `beforeInteractive`-скриптом
из `localStorage` до гидрации (`suppressHydrationWarning` на `<html>` обязателен —
иначе React ругается на атрибут, выставленный вне его рендера). Тёмная палитра —
в духе Telegram Desktop, в `_tokens.scss` под `:root[data-theme="dark"]`.

**LLM/embeddings — за одной точкой абстракции.** `src/shared/api/llm/provider.ts`
(`getChatModel()`, `getClassifierModel()`) и `src/shared/api/embeddings/provider.ts`.
Никогда не хардкодь имя модели в других местах — только через эти функции.
**Важно:** Groq регулярно снимает модели с обслуживания без предупреждения
(так уже сломался весь чат один раз — `llama-3.3-70b-versatile` исчезла из каталога).
Если чат не отвечает и в коде давно ничего не менялось — первым делом проверяй
это (`curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer $GROQ_API_KEY"`),
а не ищи баг в приложении.

**Безопасность (кризисный классификатор).** Каждое сообщение пользователя (онбординг,
supplement, основной чат) сначала идёт через `classifyMessage()` на отдельной
модели (`getClassifierModel()`, structured output) — три уровня: `none` /
`mild_distress` / `acute_crisis`. При `acute_crisis` персона вообще не вызывается —
отдаётся заранее написанный фиксированный текст (`getCrisisResponseText()`,
`Safety.crisisResponse` в i18n) с номером горячей линии
(`src/shared/config/safety.ts`, `CRISIS_HOTLINE_NUMBER`). Это намеренно — не
полагаться на то, что LLM "правильно себя поведёт" в кризисной ситуации.

**RAG.** Файлы загружаются в приватный Storage-бакет `training-files`
(`{user_id}/{uuid}-{filename}`, RLS по первому сегменту пути), чанкуются и
эмбеддятся в `memory_chunks` (`vector(1024)`, ivfflat/cosine). Размерность
эмбеддинга — `EMBEDDING_VECTOR_DIMENSIONS` в `embeddings/provider.ts`, должна
совпадать со схемой в `0001_init.sql`.

**Онбординг/дообучение персоны — общий UI-компонент.** `widgets/training-chat/TrainingChatShell`
параметризован `mode: 'onboarding' | 'supplement'`, использует один и тот же
инструмент `updatePersonaProfile` (`entities/persona/api/update-profile-tool.ts`),
но разные системные промпты и завершающий tool (`completeOnboarding` /
`finishTrainingSession`). Кнопка загрузки материалов живёт только здесь —
на обычной `/chat` её нет.

## Карта директорий (что где искать)

- `app/(auth)` — login/register (публичные), `app/(protected)` — chat/onboarding/settings (требуют сессию)
- `app/api/chat` — единственный streaming-эндпоинт чата (см. выше)
- `app/api/ingest` — приём и обработка загруженных файлов для RAG
- `app/api/trpc/[trpc]` — весь остальной CRUD
- `src/shared/api/trpc/routers/` — persona, messages, consents, training-files, feedback
- `src/shared/config/` — константы/enum'ы с типами (persona statuses, locale, theme, safety, consents...)
- `src/features/switch-locale`, `switch-theme` — server action / localStorage-переключатели, каждый со своим `shared/ui/Switch`
- `src/widgets/persona-settings-panel`, `views/settings-page` — настройки собраны из `shared/ui/SettingsSection` (общий компонент секции с разделителем — не дублируй локальные `.section` стили в новых виджетах, иначе разделители между блоками разъедутся, как уже было)
- `supabase/migrations/*.sql` — **применяются пользователем вручную** через Supabase SQL Editor, не через CLI/CI. После написания миграции отдай файл через `SendUserFile` (не вставляй SQL в текст чата — пользователь несколько раз не мог увидеть код прямо в сообщении) и дождись подтверждения, что применена, прежде чем полагаться на новую схему в тестах.

## Переменные окружения (`.env.local`, не в репозитории)

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`GROQ_API_KEY`, `EMBEDDINGS_API_KEY` (Voyage), `RESEND_API_KEY`, `SUPPORT_EMAIL`,
`UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` (rate-limit фидбека),
`QSTASH_TOKEN`. Те же значения продублированы в Vercel env (все окружения).

## Git-workflow

Каждая логическая единица работы (фича/фикс/UI-правка) — **отдельная ветка от
`main`**, с содержательными коммитами на русском (что и, отдельно, зачем/что
проверено — не только "что"). Дальше:

```
git checkout -b <тип>/<короткое-имя> main
# реализация
pnpm lint && pnpm build
# живая проверка в браузере, если есть UI/UX-часть — см. ниже
git push -u origin <branch>
gh pr create --title "…" --body "…"
gh pr merge <N> --merge --delete-branch
```

Ветки называй по содержанию (`feature/...`, `fix/...`), PR — не прямой merge:
`gh` установлен и авторизован в этом окружении, используй его. После мержа PR
следующая ветка создаётся от уже обновлённого `main` — ветки, как правило,
последовательны и могут зависеть друг от друга (см. пример: слой центрирования
настроек делался раньше переключателя темы именно потому, что тема добавляла
в него ровно одну новую секцию — порядок веток в плане может отличаться от
порядка пунктов в исходном запросе пользователя, если так меньше переделок).

**Перед любым git-действием, которое может отменить незакоммиченную работу**
(`checkout`/`restore`/`reset`/`clean`) — сначала `git status`.

## Тестирование против живой БД

**Отдельного тестового окружения Supabase нет — тесты идут против прод-базы.**
Это означает предельную аккуратность:

- Тестовых пользователей создавай через Supabase Admin API
  (`POST /auth/v1/admin/users` с `email_confirm: true`, домен `@yandex.ru` —
  проходит доменную валидацию, не хочет реальных писем) — это обходит rate-limit
  и не шлёт письма подтверждения, в отличие от публичной формы регистрации.
- **Перед любым DELETE/UPDATE — сначала прочитай и глазами отдели тестовые
  данные от настоящих.** Настоящих аккаунтов пользователя со временем
  становится больше (он сам тестирует прод) — нельзя полагаться на
  зафиксированный список email'ов из прошлой сессии. Правило: реальные —
  всё, что не создавал ты сам в текущей сессии тестирования.
- После тестирования — удаляй созданного тестового пользователя через
  `DELETE /auth/v1/admin/users/{id}` (каскадом чистит `public.users` и
  связанные таблицы) и проверяй итоговый список `public.users`, что остались
  только реальные аккаунты.
- Никогда не запрашивай `messages`/другие таблицы без фильтра по
  `persona_id`/`user_id` тестовой сущности — легко зацепить и вывести на
  экран переписку настоящего пользователя.

## Известные особенности окружения

- **`pnpm`/`npm` глобально не ставится** (permission-ошибка на `/usr/local`,
  и `~/.npm` cache root-owned). Рабочий обход: `npx --yes pnpm@latest <cmd>`
  для всего (`pnpm dlx vercel@latest ...` аналогично для Vercel CLI). Не трать
  время на попытки `npm install -g`.
- **`gh` CLI** установлен через `brew install gh`, авторизован (`gh auth login`,
  device flow) — PR можно создавать и мержить напрямую, без ручного шага
  пользователя.
- **Vercel** — тот же `pnpm dlx vercel@latest`; деплой прода происходит
  автоматически на push в `main`, ручной деплой обычно не нужен.
- **Service Worker в dev-режиме** может закэшировать старый бандл и маскировать
  то, что твой фикс уже применился (например, вернуть исчезнувшую hydration-
  warning, которой на самом деле уже нет). Если после `git diff`-подтверждённого
  фикса браузер всё ещё показывает старое поведение — сначала проверь
  `navigator.serviceWorker.getRegistrations()` / `caches.keys()` и почисти,
  прежде чем искать баг дальше.
- **zsh не делает word-splitting** невставленной переменной с командой
  (`VAR="a b c"; $VAR` не работает, в отличие от bash) — инлайни команду
  целиком вместо косвенного вызова через переменную.
- `status` — зарезервированное имя переменной в zsh, не используй его в скриптах.

## Стиль работы с пользователем

- Пользователь пишет по-русски, комментарии в коде и коммиты — тоже на
  русском (единственное исключение — сами имена переменных/функций на
  английском, по конвенции кода).
- Коммит-сообщения подробные: что изменилось, почему (если не очевидно) и
  **что именно было проверено вживую** — это уже устоявшийся паттерн в
  истории репозитория, продолжай ему следовать.
- Файлы (особенно SQL-миграции) — через `SendUserFile`, не вставкой в текст
  ответа: пользователь на обычном интерфейсе не всегда видит код прямо в
  сообщении.
- Для UI/UX-изменений обязательна живая проверка в браузере (не только
  `lint`/`build`) — резайз на десктоп/мобильную ширину, где уместно; заводить
  и потом убирать за собой тестового пользователя, как описано выше.
- Не удаляй и не трогай ничего в проде без явного запроса — включая данные
  реальных пользователей, ветки, деплои.
