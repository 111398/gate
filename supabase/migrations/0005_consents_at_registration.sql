-- Согласия теперь принимаются прямо на форме регистрации (два чекбокса под
-- email/паролем), а не постфактум через ConsentModal — см. обсуждение с
-- пользователем после первого прод-релиза. Флаги передаются в
-- supabase.auth.signUp({ options: { data: { consent_training_data: true,
-- consent_not_a_replacement: true } } }) и приходят в raw_user_meta_data.
--
-- ConsentModal/AcceptConsentForm/consents.accept НЕ удаляются — остаются
-- рабочими для сценария "версия политики обновилась у уже существующего
-- пользователя" (ТЗ п.6.6). Для новых пользователей согласия теперь
-- фиксируются здесь же, при регистрации.

-- Защита от прямого запроса в обход формы: без обоих флагов в metadata
-- регистрация целиком отклоняется (тот же паттерн, что validate_email_domain
-- в 0001_init.sql).
create or replace function public.validate_signup_consents()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.raw_user_meta_data->>'consent_training_data') is distinct from 'true'
     or (new.raw_user_meta_data->>'consent_not_a_replacement') is distinct from 'true' then
    raise exception 'Both consents must be accepted to register'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger before_auth_user_created_validate_consents
  before insert on auth.users
  for each row execute function public.validate_signup_consents();

-- handle_new_user (создан в 0001_init.sql) дополняется записью согласий сразу
-- после создания public.users — на этот момент оба флага уже прошли
-- validate_signup_consents выше, поэтому raw_user_meta_data гарантированно
-- содержит 'true' для обоих типов.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email) values (new.id, new.email);

  insert into public.consents (user_id, consent_type, policy_version) values
    (new.id, 'training_data', '1.0.0'),
    (new.id, 'not_a_replacement', '1.0.0');

  return new;
end;
$$;
