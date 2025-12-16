"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function TestDBPage() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (msg: string) => {
    setResults((prev) => [...prev, msg]);
  };

  const testDatabase = async () => {
    setTesting(true);
    setResults([]);

    try {
      // Test 1: Check auth
      addResult("🔍 Testing authentication...");
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        addResult("❌ NOT AUTHENTICATED - Please log in first");
        setTesting(false);
        return;
      }
      addResult(`✅ Authenticated as: ${user.email}`);

      // Test 2: Check if invoices table exists
      addResult("\n🔍 Testing invoices table...");
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select("id")
        .limit(1);

      if (invoicesError) {
        addResult(`❌ INVOICES TABLE ERROR: ${invoicesError.message}`);
        addResult(`   Error code: ${invoicesError.code || "unknown"}`);
        if (invoicesError.code === "42P01" || invoicesError.message?.includes("does not exist")) {
          addResult("   → SOLUTION: Run supabase_setup.sql in Supabase SQL Editor");
        }
      } else {
        addResult(`✅ Invoices table exists (found ${invoicesData?.length || 0} records)`);
      }

      // Test 3: Check if clients table exists
      addResult("\n🔍 Testing clients table...");
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id")
        .limit(1);

      if (clientsError) {
        addResult(`❌ CLIENTS TABLE ERROR: ${clientsError.message}`);
        addResult(`   Error code: ${clientsError.code || "unknown"}`);
        if (clientsError.code === "42P01" || clientsError.message?.includes("does not exist")) {
          addResult("   → SOLUTION: Run supabase_setup.sql in Supabase SQL Editor");
        }
      } else {
        addResult(`✅ Clients table exists (found ${clientsData?.length || 0} records)`);
      }

      // Test 4: Try to insert a test record (then delete it)
      addResult("\n🔍 Testing INSERT permission...");
      const testClient = {
        name: `TEST_${Date.now()}`,
        phone: null,
        email: null,
      };

      const { data: insertData, error: insertError } = await supabase
        .from("clients")
        .insert(testClient)
        .select("id")
        .single();

      if (insertError) {
        addResult(`❌ INSERT PERMISSION ERROR: ${insertError.message}`);
        if (insertError.code === "42501" || insertError.message?.includes("permission")) {
          addResult("   → SOLUTION: Check RLS policies in Supabase Table Editor");
        }
      } else {
        addResult("✅ INSERT permission works");
        // Clean up test record
        await supabase.from("clients").delete().eq("id", insertData.id);
        addResult("✅ Test record cleaned up");
      }

      // Test 5: Check environment variables
      addResult("\n🔍 Checking environment...");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) {
        addResult("❌ Missing environment variables!");
      } else {
        addResult(`✅ Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
        addResult(`✅ Supabase Key: ${supabaseKey.substring(0, 20)}...`);
      }

      addResult("\n✅ DIAGNOSTIC COMPLETE");
    } catch (err: any) {
      addResult(`\n❌ UNEXPECTED ERROR: ${err.message}`);
      console.error("Test error:", err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Database Diagnostic Tool</h1>
        
        <button
          onClick={testDatabase}
          disabled={testing}
          className="mb-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? "Testing..." : "Run Diagnostic Test"}
        </button>

        {results.length > 0 && (
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Results:</h2>
            <pre className="text-white whitespace-pre-wrap font-mono text-sm">
              {results.join("\n")}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Fixes:</h2>
          <ol className="list-decimal list-inside text-white space-y-2">
            <li>Go to Supabase Dashboard → SQL Editor</li>
            <li>Open <code className="bg-slate-700 px-2 py-1 rounded">supabase_setup.sql</code> from this project</li>
            <li>Copy the entire script and paste into SQL Editor</li>
            <li>Click "Run"</li>
            <li>Wait 10 seconds, then refresh this page and run the test again</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

