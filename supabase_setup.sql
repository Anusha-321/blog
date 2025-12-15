-- Enable read access for all users to comments
create policy "Comments are viewable by everyone"
on comments for select
to public
using (true);

-- Enable insert for authenticated users
create policy "Users can insert their own comments"
on comments for insert
to authenticated
with check (auth.uid() = user_id);

-- Enable update for users own comments
create policy "Users can update their own comments"
on comments for update
to authenticated
using (auth.uid() = user_id);

-- Enable delete for users own comments
create policy "Users can delete their own comments"
on comments for delete
to authenticated
using (auth.uid() = user_id);
