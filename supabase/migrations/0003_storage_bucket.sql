-- Приватный бакет для загруженных текстовых материалов (экспорт переписки, заметки).
-- Путь объекта: {user_id}/{uuid}-{filename} — первый сегмент пути используется в RLS.

insert into storage.buckets (id, name, public)
values ('training-files', 'training-files', false)
on conflict (id) do nothing;

create policy "users manage own training files in storage"
  on storage.objects for all
  using (bucket_id = 'training-files' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'training-files' and (storage.foldername(name))[1] = auth.uid()::text);
