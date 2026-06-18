-- 1. Enable Realtime for orders
alter publication supabase_realtime add table public.orders;

-- 2. Create Cart Items Table
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  qty integer not null default 1 check (qty > 0),
  created_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

-- Enable RLS on cart_items
alter table public.cart_items enable row level security;

-- Policies for cart_items
create policy "Users can view their own cart items" on public.cart_items
  for select using (auth.uid() = user_id);

create policy "Users can insert their own cart items" on public.cart_items
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own cart items" on public.cart_items
  for update using (auth.uid() = user_id);

create policy "Users can delete their own cart items" on public.cart_items
  for delete using (auth.uid() = user_id);

-- 3. Create Storage Buckets
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage RLS Policies
create policy "Anyone can read avatars" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can update their own avatars" on storage.objects
  for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can delete their own avatars" on storage.objects
  for delete using (bucket_id = 'avatars' and auth.role() = 'authenticated');
