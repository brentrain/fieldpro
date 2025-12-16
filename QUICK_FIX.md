# Quick Fix for Database Errors

If you're getting errors like "Could not find the table 'public.invoices'" or can't pull clients, follow these steps:

## Step 1: Open Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

## Step 2: Run the Setup Script

1. Open the file `supabase_setup.sql` in this project folder
2. **Copy the ENTIRE contents** of the file
3. **Paste it** into the SQL Editor in Supabase
4. Click the **"Run"** button (or press Cmd/Ctrl + Enter)

## Step 3: Verify Tables Were Created

1. In Supabase, go to **"Table Editor"** in the left sidebar
2. You should see these tables:
   - ✅ `clients` (should already exist, but now has address columns)
   - ✅ `invoices` (newly created)
   - ✅ `invoice_items` (newly created)
   - ✅ `company_profiles` (newly created)

## Step 4: Check Row Level Security

If you still can't access clients:

1. Go to **"Table Editor"** → Click on `clients` table
2. Click the **"Policies"** tab at the top
3. Make sure there's a policy that allows access (the script creates one)

If there's no policy or it's blocking access:
- Go back to SQL Editor
- Run this to allow access:

```sql
-- Allow all operations on clients table
DROP POLICY IF EXISTS "Allow all operations on clients" ON clients;
CREATE POLICY "Allow all operations on clients"
  ON clients FOR ALL
  USING (true)
  WITH CHECK (true);
```

## Step 5: Refresh Your App

1. Go back to your FieldPro app
2. **Hard refresh** the page (Cmd/Ctrl + Shift + R)
3. Try creating an invoice again

## Still Having Issues?

If you're still getting errors:

1. **Check the browser console** (F12) for specific error messages
2. **Check Supabase logs**:
   - Go to Supabase Dashboard
   - Click "Logs" in the left sidebar
   - Look for any error messages

3. **Verify your environment variables**:
   - Make sure `.env.local` has your Supabase URL and anon key
   - Restart your dev server after changing `.env.local`

## Common Issues

### "relation does not exist"
- **Solution**: Run the `supabase_setup.sql` script

### "permission denied" or "row-level security"
- **Solution**: Check RLS policies in Supabase Table Editor → Policies tab
- Run the policy creation SQL from Step 4 above

### "Cannot read property of undefined"
- **Solution**: Make sure all tables exist and have data
- Check that you're logged in with a valid user account

