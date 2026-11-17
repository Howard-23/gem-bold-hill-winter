create table if not exists pairs (
  id text primary key,
  code text not null unique,
  created_by text not null,
  partner_id text,
  created_at timestamptz not null default now()
);

create unique index if not exists pairs_created_by_idx on pairs (created_by);
create unique index if not exists pairs_partner_id_idx on pairs (partner_id) where partner_id is not null;

create table if not exists notes (
  id text primary key,
  pair_id text not null references pairs (id),
  author_id text not null,
  image_data text not null,
  created_at timestamptz not null default now()
);

create index if not exists notes_pair_created_idx on notes (pair_id, created_at desc);
