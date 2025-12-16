# Fix "Could not find the table 'public.invoices' in the schema cache" Error

## What is the Schema Cache?

The **schema cache** is Supabase's internal cache that stores information about your database tables, columns, and permissions. It's not a physical location you can access - it's managed automatically by Supabase.

When you create a new table, Supabase needs to refresh this cache to recognize the new table. Sometimes this happens automatically, but sometimes you need to help it along.

## Where is the invoices table?

The `public.invoices` table should be in your **Supabase database** (not in your code). It's created by running SQL scripts in the Supabase SQL Editor.

## How to Fix This Error

### Option 1: Run the Fix Script (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Fix Script**
   - Open `fix_invoices_table.sql` from this project
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Wait 10-15 seconds** for the schema cache to refresh

5. **Verify the Table Exists**
   - Go to "Table Editor" in the left sidebar
   - You should see `invoices` in the list
   - Click on it to verify it has the correct columns

6. **Refresh Your App**
   - Hard refresh your browser (Cmd/Ctrl + Shift + R)
   - The error should be gone

### Option 2: Run the Full Setup Script

If Option 1 doesn't work, run the complete setup:

1. Open `supabase_setup.sql` from this project
2. Copy the entire script
3. Paste into Supabase SQL Editor
4. Click "Run"
5. Wait 10-15 seconds
6. Refresh your app

### Option 3: Force Schema Cache Refresh

If the table exists but still shows the error:

1. **Verify Table Exists**
   - Go to Supabase → Table Editor
   - Confirm `invoices` table is there

2. **Check RLS Policies**
   - Click on `invoices` table
   - Go to "Policies" tab
   - You should see policies for SELECT, INSERT, UPDATE, DELETE

3. **Run This Query** (forces cache refresh):
   ```sql
   SELECT * FROM public.invoices LIMIT 1;
   ```

4. **Restart Your App**
   - Stop your Next.js dev server (Ctrl+C)
   - Restart it: `npm run dev`
   - Hard refresh browser (Cmd/Ctrl + Shift + R)

### Option 4: Check Your Supabase Connection

If none of the above works:

1. **Verify Environment Variables**
   - Check `.env.local` file exists
   - Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct

2. **Test Connection**
   - In Supabase SQL Editor, run:
     ```sql
     SELECT table_name 
     FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name = 'invoices';
     ```
   - If this returns a row, the table exists
   - If it returns nothing, the table doesn't exist (run the setup script)

## Common Issues

### Issue: "Table exists but still getting error"
- **Solution**: Wait 30-60 seconds after creating the table, then refresh your app
- **Solution**: Restart your Next.js dev server

### Issue: "Permission denied" error
- **Solution**: Check RLS policies in Table Editor → Policies tab
- **Solution**: Run the fix script which sets up proper policies

### Issue: "Foreign key constraint" error
- **Solution**: Make sure `clients` table exists first (run `supabase_setup.sql`)

## Still Having Issues?

1. Check the browser console (F12) for the exact error message
2. Check Supabase logs: Dashboard → Logs → Postgres Logs
3. Verify you're logged in to your app (authentication required for RLS)

