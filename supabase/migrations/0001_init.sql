-- Схема MVP «Gate» — см. ТЗ п.5.
-- Выполнить целиком в Supabase Dashboard -> SQL Editor на новом/чистом проекте.

create extension if not exists vector;
create extension if not exists pgcrypto;

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  consent_type text not null check (consent_type in ('training_data', 'not_a_replacement')),
  policy_version text not null,
  accepted_at timestamptz not null default now()
);

create table personas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  relationship text,
  interaction_frequency text not null default 'manual', -- 'daily' | 'few_times_week' | 'weekly' | 'manual'
  status text not null default 'onboarding', -- 'onboarding' | 'training' | 'active' | 'deleted'
  created_at timestamptz not null default now()
);

create table training_files (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid not null references personas(id) on delete cascade,
  file_type text not null check (file_type in ('chat_export', 'text_note')),
  storage_path text not null,
  processed boolean not null default false,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid not null references personas(id) on delete cascade,
  sender text not null check (sender in ('user', 'persona', 'system')),
  content text not null,
  is_safety_flagged boolean not null default false,
  created_at timestamptz not null default now()
);

-- Размерность vector(1024) — placeholder под будущую embedding-модель (см. этап 5 реализации),
-- поменять здесь и пересоздать таблицу/индекс при выборе конкретного провайдера.
create table memory_chunks (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid not null references personas(id) on delete cascade,
  source_file_id uuid references training_files(id) on delete set null,
  content text not null,
  embedding vector(1024),
  created_at timestamptz not null default now()
);

create index on memory_chunks using ivfflat (embedding vector_cosine_ops);

create table feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  type text not null check (type in ('complaint', 'suggestion')),
  message text not null,
  created_at timestamptz not null default now()
);

-- === RLS: пользователь имеет доступ только к своим данным ===

alter table users enable row level security;
create policy "users read own row" on users
  for select using (auth.uid() = id);
create policy "users update own row" on users
  for update using (auth.uid() = id);
-- insert в users делает только триггер handle_new_user() (security definer), не клиент.

alter table consents enable row level security;
create policy "users manage own consents" on consents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table personas enable row level security;
create policy "users manage own personas" on personas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table training_files enable row level security;
create policy "users manage own training_files" on training_files
  for all using (
    exists (select 1 from personas where personas.id = training_files.persona_id and personas.user_id = auth.uid())
  ) with check (
    exists (select 1 from personas where personas.id = training_files.persona_id and personas.user_id = auth.uid())
  );

alter table messages enable row level security;
create policy "users manage own messages" on messages
  for all using (
    exists (select 1 from personas where personas.id = messages.persona_id and personas.user_id = auth.uid())
  ) with check (
    exists (select 1 from personas where personas.id = messages.persona_id and personas.user_id = auth.uid())
  );

alter table memory_chunks enable row level security;
create policy "users read own memory_chunks" on memory_chunks
  for select using (
    exists (select 1 from personas where personas.id = memory_chunks.persona_id and personas.user_id = auth.uid())
  );
-- insert/update/delete в memory_chunks делает только сервер (service role, RAG-конвейер), клиент не пишет напрямую.

alter table feedback enable row level security;
create policy "users submit own feedback" on feedback
  for insert with check (auth.uid() = user_id);
-- select/update/delete политик для клиента намеренно нет — обращения читает только сервисная роль.

-- === Автосоздание строки public.users при регистрации ===

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- === Валидация домена почты на уровне БД (источник истины, не обходится в обход формы) ===
--
-- ТЗ ссылается на Supabase Auth Hook "before user created". Вместо него используется
-- BEFORE INSERT-триггер прямо на auth.users — тот же эффект (создание пользователя с
-- недопустимым доменом невозможно ни через форму, ни прямым вызовом Supabase API), но
-- триггер не зависит от отдельного включения Auth Hooks в дашборде и является более
-- давно задокументированным, стабильным механизмом Supabase.
--
-- Список разрешённых суффиксов домена продублирован из src/shared/config/email.ts —
-- при расширении списка обновить оба места.

create or replace function public.validate_email_domain()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (lower(new.email) like '%.ru') then
    raise exception 'Регистрация доступна только с email на домене .ru'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger before_auth_user_created_validate_domain
  before insert on auth.users
  for each row execute function public.validate_email_domain();
