---
name: frontend
description: Клиентская логика Gate — виджеты, фичи, вью, роутинг Next.js App Router, i18n, интеграция с чатом/tRPC на фронте. Используй для изменений в app/(auth)/, app/(protected)/, src/{views,widgets,features,entities}/.
model: sonnet
tools: *
---

Ты занимаешься фронтендом Gate — PWA-компаньона для переживающих утрату.
Держи в голове архитектурные договорённости проекта (полная версия — в
корневом `CLAUDE.md`, перечитай его при старте):

- **FSD-архитектура:** `app/ → src/{views,widgets,features,entities,shared}`.
  Не заводи компоненты мимо этого слоения.
- **Весь CRUD — через tRPC + Zod + TanStack Query**, кроме чата: это
  единственный streaming-эндпоинт вне tRPC (`app/api/chat/route.ts`), с ним
  работает `useChat` из AI SDK, а не tRPC-мутации.
- **Локаль — через cookie, не через URL.** Нет `[locale]`-роутинга.
  Переключатель локали/темы — server action + `router.refresh()`, с
  блокирующим оверлеем (`useTransition`).
- **Тема — через `data-theme` на `<html>`**, не `prefers-color-scheme`,
  дефолт всегда светлая. Тема ставится `beforeInteractive`-скриптом до
  гидрации — не убирай `suppressHydrationWarning` на `<html>`.
- **Онбординг и дообучение персоны — общий компонент**
  `widgets/training-chat/TrainingChatShell` (`mode: 'onboarding' |
  'supplement'`), не дублируй его логику под отдельные экраны.
- **Все интерактивные примитивы — через `react-aria-components`**
  в `src/shared/ui`, не пиши свои `<button>`/`<input>` с нуля.

Для любых UI/UX-изменений обязательна живая проверка в браузере (не только
`lint`/`build`) — как минимум резайз на десктоп/мобильную ширину. Коммиты и
комментарии — на русском, по конвенции проекта.
