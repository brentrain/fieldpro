# FieldPro Setup Instructions

## Database Setup

To fix the "Could not find the table 'public.invoices'" error, you need to create the required database tables in Supabase.

### Steps:

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Setup Script**
   - Open the file `supabase_setup.sql` in this project
   - Copy the entire contents
   - Paste it into the SQL Editor in Supabase
   - Click "Run" to execute the script

4. **Verify Tables Created**
   - Go to "Table Editor" in Supabase
   - You should now see these tables:
     - `company_profiles`
     - `invoices`
     - `invoice_items`
   - The `clients` table should now have address columns added

## Features Added

### 1. Invoice Creation
- Create invoices with line items
- Automatic invoice number generation
- Company information displayed at the top

### 2. Pay Now Button
- Prominent "Pay Now" button on invoice detail page
- Shows amount due and due date
- Links to PayPal, Stripe, or Venmo (configured in Company Settings)

### 3. Company Settings
- Go to `/company` to set up your company information
- Add payment links (PayPal, Stripe, Venmo)
- Company info appears on all invoices

## Next Steps

1. **Set up Company Profile**
   - Navigate to `/company` in your app
   - Fill in your company information
   - Add your payment links (PayPal.me, Stripe payment links, Venmo links)

2. **Create Your First Invoice**
   - Go to `/invoices`
   - Click "Create Invoice"
   - Select a client and add line items
   - The invoice will display with your company info and "Pay Now" buttons

3. **Share Invoices**
   - View any invoice at `/invoices/[id]`
   - The "Pay Now" button will be prominently displayed
   - Clients can click to pay via your configured payment methods

## Payment Link Setup

### PayPal
- Create a PayPal.me link: https://www.paypal.com/paypalme/yourname
- Or use a PayPal payment button link

### Stripe
- Create a Stripe payment link in your Stripe dashboard
- Format: https://buy.stripe.com/...

### Venmo
- Create a Venmo link: https://venmo.com/yourname
- Or use a Venmo QR code link

Add these links in the Company Settings page (`/company`).

