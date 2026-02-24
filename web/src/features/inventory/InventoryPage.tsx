import { useEffect, useMemo, useState } from "react";
import { Button } from "../../shared/ui/Button";
import { addMovement, fetchMovements, fetchProductsForInventory, type InventoryMovementRow } from "./inventoryApi";
import type { ProductRow } from "../products/types";

export function InventoryPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [movs, setMovs] = useState<InventoryMovementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [reason, setReason] = useState<"restock" | "waste" | "adjustment">("restock");
  const [note, setNote] = useState("");

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const [p, m] = await Promise.all([
        fetchProductsForInventory(),
        fetchMovements(80),
      ]);
      setProducts(p);
      setMovs(m);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  const lowStock = useMemo(() => {
  return products.filter(p => Number(p.stock) <= Number((p as any).low_stock_threshold ?? 5) && p.is_active);
}, [products]);

  const productMap = useMemo(() => {
    const m = new Map<string, ProductRow>();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  async function onApply() {
    if (!productId) return;
    const q = Number(qty);
    if (!Number.isFinite(q) || q <= 0) return;

    // Entrada: +q, Merma: -q, Ajuste: puede ser + o -, pero aquí lo haremos según signo en UI
    const qtyChange =
      reason === "restock" ? q :
      reason === "waste" ? -q :
      q; // adjustment: dejamos +q (si quieres negativo pones qty negativo manualmente luego)

    setError("");
    try {
      await addMovement({
        productId,
        reason,
        qtyChange,
        note,
      });
      setQty("1");
      setNote("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error aplicando movimiento");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Inventario</h1>
          <p className="text-black/70">Entrada (reposiciones), salida (merma) y registro de movimientos.</p>
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

      {lowStock.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-semibold mb-2">⚠ Stock bajo</div>
          <ul className="list-disc pl-5">
            {lowStock.map(p => (
              <li key={p.id}>
                {p.name}: {p.stock} {p.unit}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border p-4 space-y-3">
        <div className="font-semibold">Registrar movimiento</div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
          <select className="rounded-xl border px-3 py-2" value={productId} onChange={(e)=>setProductId(e.target.value)}>
            <option value="">Selecciona producto...</option>
            {products.filter(p=>p.is_active).map(p => (
              <option key={p.id} value={p.id}>
                {p.name} (stock: {p.stock})
              </option>
            ))}
          </select>

          <select className="rounded-xl border px-3 py-2" value={reason} onChange={(e)=>setReason(e.target.value as any)}>
            <option value="restock">Entrada / Reposición (+)</option>
            <option value="waste">Salida / Merma (-)</option>
            <option value="adjustment">Ajuste (+)</option>
          </select>

          <input className="rounded-xl border px-3 py-2" value={qty} onChange={(e)=>setQty(e.target.value)} placeholder="Cantidad" />

          <input className="rounded-xl border px-3 py-2" value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Nota (opcional)" />
        </div>

        <Button onClick={onApply} disabled={!productId || Number(qty) <= 0}>
          Aplicar
        </Button>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        <div className="grid grid-cols-12 gap-2 bg-black/5 px-4 py-2 text-xs font-medium">
          <div className="col-span-4">Producto</div>
          <div className="col-span-2">Razón</div>
          <div className="col-span-2">Cambio</div>
          <div className="col-span-2">Check</div>
          <div className="col-span-2">Fecha</div>
        </div>

        {movs.map(m => {
          const p = productMap.get(m.product_id);
          return (
            <div key={m.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-t text-sm items-center">
              <div className="col-span-4">{p?.name ?? m.product_id.slice(0, 8)}</div>
              <div className="col-span-2">{m.reason}</div>
              <div className="col-span-2">{m.qty_change}</div>
              <div className="col-span-2">{m.ref_check_id ? m.ref_check_id.slice(0, 8) + "…" : "-"}</div>
              <div className="col-span-2">{new Date(m.created_at).toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}