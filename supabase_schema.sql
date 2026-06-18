-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text unique,
  role text not null default 'customer',
  phone text,
  image text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Trigger to automatically create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  old_price numeric,
  category text not null,
  tag text check (tag in ('Flash Sale', 'Best Seller', 'New Arrival', 'Featured')),
  brand text default 'TechNova',
  img text not null,
  stock integer not null default 0,
  description text default '',
  rating integer default 5,
  specs jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create orders table
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  items jsonb not null, -- Array of { product: product_id, qty, priceAtPurchase }
  shipping_details jsonb not null,
  delivery_type text not null default 'standard',
  payment_method text not null,
  financials jsonb not null,
  status text not null default 'Processing',
  tracking_update text not null default 'Order registered into fulfillment queue.',
  reference text,
  payment_reference text,
  payment_status text not null default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create reviews table
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  email text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  text text not null,
  product text default 'General Shopping Experience',
  status text not null default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
