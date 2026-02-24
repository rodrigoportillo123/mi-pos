import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/ui/Button";
import type { CheckRow, TableRow } from "./types";
import { closeCheck, fetchOpenChecks, fetchTables, openCheck } from "./posApi";
import { supabase } from "../../lib/supabaseClient";
type TableCardState =
  | { state: "idle" }
  | { state: "open"; check: CheckRow };

export function PosPage() {
  const [tables, setTables] = useState<TableRow[]>([]);
  const [openChecks, setOpenChecks] = useState<CheckRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyTableId, setBusyTableId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const [t, oc] = await Promise.all([fetchTables(), fetchOpenChecks()]);
      setTables(t);
      setOpenChecks(oc);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const openByTable = useMemo(() => {
    const map = new Map<number, CheckRow>();
    for (const c of openChecks) map.set(c.table_id, c);
    return map;
  }, [openChecks]);

  function getState(tableId: number): TableCardState {
    const check = openByTable.get(tableId);
    if (check) return { state: "open", check };
    return { state: "idle" };
  }

  async function handleOpen(tableId: number) {
    setBusyTableId(tableId);
    setError("");
    try {
      // Evita abrir doble si ya hay open
      if (openByTable.has(tableId)) return;
      await openCheck(tableId);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setBusyTableId(null);
    }
  }

  async function getCheckItemsCount(checkId: string): Promise<number> {
  const { count, error } = await supabase
    .from("check_items")
    .select("*", { count: "exact", head: true })
    .eq("check_id", checkId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}
 async function handleClose(checkId: string, tableId: number) {
  setBusyTableId(tableId);
  setError("");
  try {
    const itemCount = await getCheckItemsCount(checkId);

    if (itemCount === 0) {
      setError(`No puedes cerrar la Mesa ${tableId} sin items en el pedido.`);
      return;
    }

    const ok = window.confirm(`¿Cerrar cuenta de Mesa ${tableId}? Se descontará inventario y se registrará la venta.`);
    if (!ok) return;

    await closeCheck(checkId);
    await refresh();
  } catch (e) {
    setError(e instanceof Error ? e.message : "Error desconocido");
  } finally {
    setBusyTableId(null);
  }
}

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">POS — Mesas</h1>
          <p className="text-black/70">Fase 2: abrir y cerrar cuenta por mesa (sin pedidos aún).</p>
        </div>
        <Button variant="ghost" onClick={refresh} disabled={loading}>
          {loading ? "Cargando..." : "Refrescar"}
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {tables.map((t) => {
          const st = getState(t.id);
          const busy = busyTableId === t.id;

          const badge =
            st.state === "open" ? (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                Abierta
              </span>
            ) : (
              <span className="rounded-full bg-black/5 px-2 py-1 text-xs text-black/70">
                Libre
              </span>
            );

          return (
            <div key={t.id} className="rounded-2xl border p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{t.name}</div>
                {badge}
              </div>

              <div className="mt-3 text-sm text-black/60">
                {st.state === "open" ? (
                  <div>
                    <div>Check: <span className="font-mono text-xs">{st.check.id.slice(0, 8)}…</span></div>
                    <div>Abierta: {new Date(st.check.opened_at).toLocaleString()}</div>
                  </div>
                ) : (
                  <div>Sin cuenta activa</div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                {st.state === "idle" ? (
                  <Button onClick={() => handleOpen(t.id)} disabled={busy}>
                    {busy ? "Abriendo..." : "Abrir cuenta"}
                  </Button>
                ) : (
                  <>
                    <Link to={`/pos/${t.id}`}>
                      <Button variant="ghost">
                        Ver pedido
                      </Button>
                    </Link>

                    <Button onClick={() => handleClose(st.check.id, t.id)} disabled={busy}>
                      {busy ? "Cerrando..." : "Cerrar cuenta"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}