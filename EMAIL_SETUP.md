# Email Setup for Invoice Sending

## What's New

✅ **Email Sending**: Invoices can now be sent directly to clients via email  
✅ **LemonSqueezy Integration**: "Pay Now" button links to your LemonSqueezy account  
✅ **Professional Email Templates**: Beautiful HTML emails with invoice details

## Setup Steps

### 1. Add LemonSqueezy Column to Database

Run this SQL in Supabase SQL Editor:

```sql
ALTER TABLE public.company_profiles ADD COLUMN IF NOT EXISTS lemonsqueezy_link TEXT;
```

Or use the file: `ADD_LEMONSQUEEZY.sql`

### 2. Configure Resend (Email Service)

1. Sign up for Resend at https://resend.com
2. Get your API key from the Resend dashboard
3. Add to your `.env.local` file:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
FROM_EMAIL=your-verified-email@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: 
- `FROM_EMAIL` must be a verified domain/email in Resend
- `NEXT_PUBLIC_APP_URL` should be your production URL when deployed

### 3. Add Your LemonSqueezy Link

1. Go to your app → **Company** page
2. Scroll to "Payment Integration Links"
3. Enter your LemonSqueezy checkout link in the "LemonSqueezy Link" field
4. Click "Save Company Profile"

**How to get your LemonSqueezy link:**
- Go to your LemonSqueezy dashboard
- Create a product or use an existing one
- Copy the checkout link (looks like: `https://yourstore.lemonsqueezy.com/checkout/...`)

### 4. Test It Out

1. Create an invoice
2. Go to the invoice detail page
3. Click "Send Email" button
4. The invoice will be sent to the client's email with a "Pay Now" button

## How It Works

1. **Invoice Email**: When you click "Send Email", the app:
   - Generates a beautiful HTML email with the invoice details
   - Includes a prominent "Pay Now" button linking to your LemonSqueezy checkout
   - Sends it via Resend to the client's email address

2. **Pay Now Button**: 
   - Shows prominently on the invoice (both in email and on the web page)
   - Links directly to your LemonSqueezy checkout
   - If LemonSqueezy link is not set, it falls back to Stripe, PayPal, or Venmo

3. **Client Experience**:
   - Client receives professional invoice email
   - Clicks "Pay Now" button
   - Goes directly to LemonSqueezy checkout
   - Completes payment

## Troubleshooting

### "Resend API key not configured"
- Make sure `RESEND_API_KEY` is set in `.env.local`
- Restart your dev server after adding the key

### "Failed to send email"
- Check that `FROM_EMAIL` is verified in Resend
- Check Resend dashboard for error logs
- Make sure the client email address is valid

### Pay Now button not showing
- Make sure you've added your LemonSqueezy link in Company settings
- Refresh the invoice page after saving

## Notes

- The email includes a link to view the invoice online
- The "Pay Now" button prioritizes LemonSqueezy, then falls back to other payment methods
- All payment links are optional - you can use any combination you want

