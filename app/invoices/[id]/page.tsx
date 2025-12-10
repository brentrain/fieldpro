"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

type Client = {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
};

type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
};

type Invoice = {
  id: string;
  client_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  total_cents: number;
  status: string;
  notes: string | null;
};

type CompanyProfile = {
  company_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  paypal_link: string | null;
  stripe_link: string | null;
  venmo_link: string | null;
};

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      setAuthChecking(false);
      setLoading(true);

      try {
        // Fetch invoice
        const { data: invoiceData, error: invoiceError } = await supabase
          .from("invoices")
          .select("*")
          .eq("id", invoiceId)
          .single();

        if (invoiceError) throw invoiceError;

        // Fetch client
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("*")
          .eq("id", invoiceData.client_id)
          .single();

        if (clientError) throw clientError;

        // Fetch invoice items
        const { data: itemsData, error: itemsError } = await supabase
          .from("invoice_items")
          .select("*")
          .eq("invoice_id", invoiceId);

        if (itemsError) throw itemsError;

        // Fetch company profile
        const { data: companyData, error: companyError } = await supabase
          .from("company_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (companyError && companyError.code !== "PGRST116") {
          console.error("Error fetching company profile:", companyError);
        }

        setInvoice(invoiceData);
        setClient(clientData);
        setInvoiceItems(itemsData || []);
        setCompanyProfile(companyData || null);
      } catch (err: any) {
        console.error("Error fetching invoice:", err);
        setError(err.message || "Failed to load invoice.");
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId, router]);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCompanyAddress = () => {
    if (!companyProfile) return "";
    const parts = [
      companyProfile.address,
      companyProfile.city,
      companyProfile.state,
      companyProfile.zip_code,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const getClientAddress = () => {
    if (!client) return "";
    const parts = [
      client.address,
      client.city,
      client.state,
      client.zip_code,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const handleSendEmail = async () => {
    if (!client?.email || !invoice) {
      setError("Client email is required to send invoice.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      // This would integrate with your email service (Resend)
      // For now, we'll create a mailto link fallback
      const subject = encodeURIComponent(
        `Invoice ${invoice.invoice_number} from ${companyProfile?.company_name || "Your Company"}`
      );
      const body = encodeURIComponent(
        `Please find attached invoice ${invoice.invoice_number} for ${formatCurrency(invoice.total_cents)}.\n\nDue date: ${formatDate(invoice.due_date)}\n\nThank you!`
      );

      window.location.href = `mailto:${client.email}?subject=${subject}&body=${body}`;
    } catch (err: any) {
      setError(err.message || "Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (authChecking || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-white">Loading...</p>
      </div>
    );
  }

  if (error || !invoice || !client) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-400">{error || "Invoice not found"}</p>
          <button
            onClick={() => router.push("/invoices")}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  const subtotal = invoiceItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price_cents,
    0
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/invoices")}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to Invoices
        </button>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="rounded-md bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
          >
            Print
          </button>
          {client.email && (
            <button
              onClick={handleSendEmail}
              disabled={sending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send Email"}
            </button>
          )}
        </div>
      </div>

      {/* Invoice Document */}
      <div className="mx-auto max-w-4xl rounded-lg border border-slate-700 bg-white p-8 shadow-lg print:shadow-none">
        {/* Company Header */}
        <div className="mb-8 border-b border-gray-200 pb-6">
          <div className="flex items-start justify-between">
            <div>
              {companyProfile?.logo_url && (
                <img
                  src={companyProfile.logo_url}
                  alt="Company Logo"
                  className="mb-4 h-16 w-auto"
                />
              )}
              <h1 className="text-2xl font-bold text-gray-900">
                {companyProfile?.company_name || "Your Company"}
              </h1>
              {getCompanyAddress() && (
                <p className="mt-2 text-sm text-gray-600">
                  {getCompanyAddress()}
                </p>
              )}
              {companyProfile?.phone && (
                <p className="text-sm text-gray-600">
                  Phone: {companyProfile.phone}
                </p>
              )}
              {companyProfile?.email && (
                <p className="text-sm text-gray-600">
                  Email: {companyProfile.email}
                </p>
              )}
              {companyProfile?.website && (
                <p className="text-sm text-gray-600">
                  Website: {companyProfile.website}
                </p>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
              <p className="mt-2 text-sm text-gray-600">
                Invoice #: {invoice.invoice_number}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="mb-8 grid grid-cols-2 gap-8">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              Bill To:
            </h3>
            <p className="font-medium text-gray-900">{client.name}</p>
            {getClientAddress() && (
              <p className="mt-1 text-sm text-gray-600">{getClientAddress()}</p>
            )}
            {client.email && (
              <p className="text-sm text-gray-600">{client.email}</p>
            )}
          </div>
          <div className="text-right">
            <div className="mb-4">
              <p className="text-sm text-gray-600">Issue Date:</p>
              <p className="font-medium text-gray-900">
                {formatDate(invoice.issue_date)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date:</p>
              <p className="font-medium text-gray-900">
                {formatDate(invoice.due_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 text-left text-sm font-semibold text-gray-700">
                  Description
                </th>
                <th className="py-3 text-right text-sm font-semibold text-gray-700">
                  Quantity
                </th>
                <th className="py-3 text-right text-sm font-semibold text-gray-700">
                  Unit Price
                </th>
                <th className="py-3 text-right text-sm font-semibold text-gray-700">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="py-3 text-right text-sm text-gray-600">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-sm text-gray-600">
                    {formatCurrency(item.unit_price_cents)}
                  </td>
                  <td className="py-3 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(item.quantity * item.unit_price_cents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mb-8 flex justify-end">
          <div className="w-64">
            <div className="flex justify-between border-t border-gray-200 pt-4">
              <span className="text-sm font-semibold text-gray-700">Total:</span>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(invoice.total_cents)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Links */}
        {(companyProfile?.paypal_link ||
          companyProfile?.stripe_link ||
          companyProfile?.venmo_link) && (
          <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">
              Payment Options:
            </p>
            <div className="flex flex-wrap gap-2">
              {companyProfile.paypal_link && (
                <a
                  href={companyProfile.paypal_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Pay with PayPal
                </a>
              )}
              {companyProfile.stripe_link && (
                <a
                  href={companyProfile.stripe_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                >
                  Pay with Stripe
                </a>
              )}
              {companyProfile.venmo_link && (
                <a
                  href={companyProfile.venmo_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                >
                  Pay with Venmo
                </a>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-700">Notes:</p>
            <p className="mt-1 text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-500">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}

