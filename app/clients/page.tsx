"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { exportToExcel } from "../lib/exportToExcel";

type Client = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  created_at?: string;
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      // Check authentication first
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      setAuthChecking(false);
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("clients")
          .select("*"); // no order() so we don't depend on created_at

        if (error) {
          console.error("Supabase error loading clients:", error);
          // Show the real message so we know what's wrong
          setError(error.message || "Failed to load clients.");
        } else {
          setClients(data || []);
        }
      } catch (err: any) {
        console.error("Unexpected error loading clients:", err);
        setError("Unexpected error loading clients.");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [router]);

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-white">Checking authentication…</p>
      </div>
    );
  }

  const handleAddClient = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("clients")
        .insert({
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          zip_code: zipCode.trim() || null,
        })
        .select("*")
        .single();

      if (error) {
        console.error("Supabase error adding client:", error);
        setError(error.message || "Failed to add client.");
      } else if (data) {
        setClients((prev) => [data, ...prev]);
        setName("");
        setPhone("");
        setEmail("");
        setAddress("");
        setCity("");
        setState("");
        setZipCode("");
      }
    } catch (err: any) {
      console.error("Unexpected error adding client:", err);
      setError("Unexpected error adding client.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Clients</h1>
          <p className="mt-1 text-sm text-white/80">
            Manage your customers and their contact info.
          </p>
        </div>
        {clients.length > 0 && (
          <button
            onClick={() => {
              const exportData = clients.map((client) => ({
                Name: client.name,
                Phone: client.phone || "",
                Email: client.email || "",
                Address: client.address || "",
                City: client.city || "",
                State: client.state || "",
                "Zip Code": client.zip_code || "",
              }));
              exportToExcel(exportData, "clients", "Clients");
            }}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Export to Excel
          </button>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="rounded-md border border-red-300/50 bg-red-500/20 p-3 text-xs text-white">
          {error}
        </div>
      )}

      {/* Add Client Form */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/90 p-4 shadow-sm backdrop-blur">
        <h2 className="text-sm font-semibold text-white">Add Client</h2>

        <form
          onSubmit={handleAddClient}
          className="mt-3 grid gap-3 md:grid-cols-2"
        >
          <div>
            <label className="block text-xs font-medium text-white/80">
              Name *
            </label>
            <input
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-700 px-2 py-1.5 text-sm text-white placeholder:text-white/50 backdrop-blur"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80">
              Phone
            </label>
            <input
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-700 px-2 py-1.5 text-sm text-white placeholder:text-white/50 backdrop-blur"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="555-123-4567"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-white/80">
              Email
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-700 px-2 py-1.5 text-sm text-white placeholder:text-white/50 backdrop-blur"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-white/80">
              Address
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-700 px-2 py-1.5 text-sm text-white placeholder:text-white/50 backdrop-blur"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80">
              City
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-700 px-2 py-1.5 text-sm text-white placeholder:text-white/50 backdrop-blur"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80">
              State
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-700 px-2 py-1.5 text-sm text-white placeholder:text-white/50 backdrop-blur"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80">
              Zip Code
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-700 px-2 py-1.5 text-sm text-white placeholder:text-white/50 backdrop-blur"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="12345"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={adding}
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add Client"}
            </button>
          </div>
        </form>
      </div>

      {/* Client List */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/90 p-4 shadow-sm backdrop-blur">
        <h2 className="text-sm font-semibold text-white">Client List</h2>

        {loading ? (
          <p className="mt-3 text-sm text-white/80">Loading clients…</p>
        ) : clients.length === 0 ? (
          <p className="mt-3 text-sm text-white/80">
            No clients added yet. Add your first one above.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-white/10">
            {clients.map((client) => {
              const fullAddress = [
                client.address,
                client.city,
                client.state,
                client.zip_code,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <div key={client.id} className="py-3 text-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-white">{client.name}</p>
                      {client.phone && (
                        <p className="text-xs text-white/80">
                          Phone: {client.phone}
                        </p>
                      )}
                      {client.email && (
                        <p className="text-xs text-white/80">
                          Email: {client.email}
                        </p>
                      )}
                      {fullAddress && (
                        <p className="text-xs text-white/80">
                          Address: {fullAddress}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex gap-2">
                      {client.phone && (
                        <>
                          <a
                            href={`tel:${client.phone.replace(/[^\d+]/g, "")}`}
                            className="rounded-md bg-green-600/20 px-3 py-1.5 text-xs text-green-400 hover:bg-green-600/30 transition"
                            title="Call"
                          >
                            📞
                          </a>
                          <a
                            href={`sms:${client.phone.replace(/[^\d+]/g, "")}`}
                            className="rounded-md bg-blue-600/20 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-600/30 transition"
                            title="Text"
                          >
                            💬
                          </a>
                        </>
                      )}
                      {fullAddress && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md bg-purple-600/20 px-3 py-1.5 text-xs text-purple-400 hover:bg-purple-600/30 transition"
                          title="Get Directions"
                        >
                          🗺️
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}