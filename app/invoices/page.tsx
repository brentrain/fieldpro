"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { exportToExcel } from "../lib/exportToExcel";

type Client = {
  id: string;
  name: string;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
};

type Job = {
  id: string;
  client_id: string;
  scheduled_at: string;
  price_cents: number | null;
  status: string;
  notes: string | null;
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
  created_at: string;
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

type InvoiceItem = {
  description: string;
  quantity: number;
  unit_price_cents: number;
};

export default function InvoicesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form fields
  const [selectedClientId, setSelectedClientId] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
  );
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price_cents: 0 },
  ]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchData = async () => {
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
        // Fetch invoices
        const { data: invoicesData, error: invoicesError } = await supabase
          .from("invoices")
          .select("*")
          .order("created_at", { ascending: false });

        if (invoicesError) throw invoicesError;

        // Fetch clients
        const { data: clientsData, error: clientsError } = await supabase
          .from("clients")
          .select("*")
          .order("name");

        if (clientsError) throw clientsError;

        // Fetch jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("*");

        if (jobsError) throw jobsError;

        // Fetch company profile
        const { data: companyData, error: companyError } = await supabase
          .from("company_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (companyError && companyError.code !== "PGRST116") {
          console.error("Error fetching company profile:", companyError);
        }

        setInvoices(invoicesData || []);
        setClients(clientsData || []);
        setJobs(jobsData || []);
        setCompanyProfile(companyData || null);
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const addInvoiceItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { description: "", quantity: 1, unit_price_cents: 0 },
    ]);
  };

  const removeInvoiceItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const updateInvoiceItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updated = [...invoiceItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setInvoiceItems(updated);
  };

  const calculateTotal = () => {
    return invoiceItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price_cents,
      0
    );
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `INV-${year}-${random}`;
  };

  const handleCreateInvoice = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || invoiceItems.length === 0) {
      setError("Please select a client and add at least one item.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      const invoiceNumber = generateInvoiceNumber();
      const totalCents = calculateTotal();

      const { data, error } = await supabase
        .from("invoices")
        .insert({
          client_id: selectedClientId,
          invoice_number: invoiceNumber,
          issue_date: issueDate,
          due_date: dueDate,
          total_cents: totalCents,
          status: "pending",
          notes: notes.trim() || null,
          user_id: user.id,
        })
        .select("*")
        .single();

      if (error) throw error;

      // Insert invoice items
      const itemsToInsert = invoiceItems.map((item) => ({
        invoice_id: data.id,
        description: item.description,
        quantity: item.quantity,
        unit_price_cents: item.unit_price_cents,
      }));

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // Reset form
      setSelectedClientId("");
      setIssueDate(new Date().toISOString().split("T")[0]);
      setDueDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
      );
      setInvoiceItems([{ description: "", quantity: 1, unit_price_cents: 0 }]);
      setNotes("");
      setShowCreateForm(false);

      // Refresh invoices list
      const { data: updatedInvoices } = await supabase
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false });

      setInvoices(updatedInvoices || []);
    } catch (err: any) {
      console.error("Error creating invoice:", err);
      setError(err.message || "Failed to create invoice.");
    } finally {
      setCreating(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "Unknown";
  };

  if (authChecking || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Invoices</h1>
          <p className="mt-1 text-sm text-white/80">
            Create and manage invoices for your clients.
          </p>
        </div>
        <div className="flex gap-2">
          {invoices.length > 0 && (
            <button
              onClick={() => {
                const exportData = invoices.map((invoice) => ({
                  "Invoice Number": invoice.invoice_number,
                  Client: getClientName(invoice.client_id),
                  "Issue Date": new Date(invoice.issue_date).toLocaleDateString(),
                  "Due Date": new Date(invoice.due_date).toLocaleDateString(),
                  Total: formatCurrency(invoice.total_cents),
                  Status: invoice.status,
                  Notes: invoice.notes || "",
                }));
                exportToExcel(exportData, "invoices", "Invoices");
              }}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Export to Excel
            </button>
          )}
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {showCreateForm ? "Cancel" : "Create Invoice"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-300/50 bg-red-500/20 p-3 text-sm text-white">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/90 p-6 shadow-sm backdrop-blur">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Create New Invoice
          </h2>

          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-white">
                  Client *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white">
                  Issue Date *
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-white">
                  Invoice Items *
                </label>
                <button
                  type="button"
                  onClick={addInvoiceItem}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-2">
                {invoiceItems.map((item, index) => (
                  <div
                    key={index}
                    className="grid gap-2 rounded-md border border-slate-600 bg-slate-700/50 p-2 md:grid-cols-12"
                  >
                    <div className="md:col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateInvoiceItem(index, "description", e.target.value)
                        }
                        placeholder="Description"
                        className="w-full rounded-md border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white placeholder:text-white/50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateInvoiceItem(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="Qty"
                        min="1"
                        className="w-full rounded-md border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white placeholder:text-white/50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="number"
                        value={item.unit_price_cents / 100}
                        onChange={(e) =>
                          updateInvoiceItem(
                            index,
                            "unit_price_cents",
                            Math.round(parseFloat(e.target.value) * 100) || 0
                          )
                        }
                        placeholder="Price"
                        step="0.01"
                        min="0"
                        className="w-full rounded-md border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white placeholder:text-white/50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-1 flex items-center justify-end">
                      {invoiceItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInvoiceItem(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2 text-right">
                <p className="text-sm font-semibold text-white">
                  Total: {formatCurrency(calculateTotal())}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Additional notes or terms..."
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Invoice"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invoices List */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/90 p-4 shadow-sm backdrop-blur">
        <h2 className="mb-4 text-sm font-semibold text-white">
          Invoice List
        </h2>

        {invoices.length === 0 ? (
          <p className="text-sm text-white/80">No invoices created yet.</p>
        ) : (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="rounded-md border border-slate-600 bg-slate-700/50 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {invoice.invoice_number}
                    </p>
                    <p className="text-sm text-white/80">
                      {getClientName(invoice.client_id)} •{" "}
                      {formatCurrency(invoice.total_cents)} • Due:{" "}
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        invoice.status === "paid"
                          ? "bg-green-500/20 text-green-400"
                          : invoice.status === "overdue"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {invoice.status}
                    </span>
                    <a
                      href={`/invoices/${invoice.id}`}
                      className="rounded-md bg-blue-600/20 px-3 py-1 text-xs text-blue-400 hover:bg-blue-600/30"
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

