-- Run this once in Supabase Dashboard > SQL Editor.
create table if not exists public.posts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  content text check (char_length(content) <= 500),
  image_url text,
  created_at timestamptz not null default now(),
  check (content is not null or image_url is not null)
);

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  content text not null check (char_length(content) between 1 and 300),
  created_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  post_id bigint not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;

drop policy if exists "Authenticated users can read posts" on public.posts;
drop policy if exists "Users can create their posts" on public.posts;
drop policy if exists "Authenticated users can read comments" on public.comments;
drop policy if exists "Users can create their comments" on public.comments;
drop policy if exists "Authenticated users can read likes" on public.post_likes;
drop policy if exists "Users can like posts" on public.post_likes;
drop policy if exists "Users can remove their likes" on public.post_likes;

create policy "Authenticated users can read posts" on public.posts for select to authenticated using (true);
create policy "Users can create their posts" on public.posts for insert to authenticated with check (auth.uid() = user_id);
create policy "Authenticated users can read comments" on public.comments for select to authenticated using (true);
create policy "Users can create their comments" on public.comments for insert to authenticated with check (auth.uid() = user_id);
create policy "Authenticated users can read likes" on public.post_likes for select to authenticated using (true);
create policy "Users can like posts" on public.post_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can remove their likes" on public.post_likes for delete to authenticated using (auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('post-images', 'post-images', true)
on conflict (id) do nothing;
drop policy if exists "Authenticated users can upload post images" on storage.objects;
drop policy if exists "Public can view post images" on storage.objects;
create policy "Authenticated users can upload post images" on storage.objects for insert to authenticated
with check (bucket_id = 'post-images' and auth.uid() = owner);
create policy "Public can view post images" on storage.objects for select to public using (bucket_id = 'post-images');
