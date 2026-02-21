import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Button } from "../../shared/ui/Button";

export function SupabaseTestPage() {
  const [status, setStatus] = useState<string>("Listo para probar conexión a DB...");
  const [loading, setLoading] = useState(false);

  async function testDbConnection() {
    setLoading(true);
    setStatus("Probando conexión a la base de datos...");

    try {
      const { data, error } = await supabase
        .from("healthcheck")
        .select("id, created_at")
        .limit(1);

      if (error) {
        setStatus(`❌ Error DB: ${error.message}`);
        return;
      }

      setStatus(`✅ DB OK. Filas leídas: ${data?.length ?? 0}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Error desconocido";
      setStatus(`❌ Error: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Test Supabase</h1>
      <p className="text-black/70">
        Esto valida conexión a <b>Supabase DB</b> (sin depender de Auth).
      </p>

      <Button onClick={testDbConnection} disabled={loading}>
        {loading ? "Probando..." : "Probar conexión DB"}
      </Button>

      <div className="rounded-2xl border p-4 text-sm">
        <div className="font-medium mb-1">Estado</div>
        <div className="text-black/80">{status}</div>
      </div>
    </div>
  );
}