-- Расширение personas: онбординг-диалог собирает не только имя и характер
-- отношений, но и возраст, черты характера человека — нужно для системного
-- промпта персоны. Выполнить в SQL Editor после 0001_init.sql.

alter table personas
  add column age integer,
  add column character_notes text;
