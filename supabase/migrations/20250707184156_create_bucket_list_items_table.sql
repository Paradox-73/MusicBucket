-- Create the bucket_list_items table
create table bucket_list_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  type text,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table bucket_list_items enable row level security;

-- Create policy to allow users to view their own items
create policy "Users can view their own items"
  on bucket_list_items for select
  using (auth.uid() = user_id);

-- Create policy to allow users to insert their own items
create policy "Users can insert their own items"
  on bucket_list_items for insert
  with check (auth.uid() = user_id);

-- Create policy to allow users to update their own items
create policy "Users can update their own items"
  on bucket_list_items for update
  using (auth.uid() = user_id);

-- Create policy to allow users to delete their own items
create policy "Users can delete their own items"
  on bucket_list_items for delete
  using (auth.uid() = user_id);