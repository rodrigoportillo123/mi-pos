import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../../shared/ui/Button";
import { fetchOpenChecks } from "./posApi";
import { addCheckItem, deleteCheckItem, fetchCheckItems, type CheckItemRow } from "./checkItemsApi";
import { fetchProducts } from "../products/productsApi";
import type { ProductRow } from "../products/types";

import { startDictation } from "../voice/speech";
import { parseVoiceOrder, type ParsedItem } from "../voice/parseorder";

export function TableDetailPage() {
  const { tableId } = useParams();
  const tid = Number(tableId);

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [checkId, setCheckId] = useState<string | null>(null);
  const [items, setItems] = useState<CheckItemRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");

  // Voz
  const [lastTranscript, setLastTranscript] = useState<string>("");
  const [pendingItems, setPendingItems] = useState<ParsedItem[] | null>(null);
  const [dictating, setDictating] = useState(false);

  const refresh = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const [prods, opens] = await Promise.all([fetchProducts(), fetchOpenChecks()]);
      setProducts(prods.filter((p) => p.is_active));

      const open = opens.find((c) => c.table_id === tid);
      if (!open) {
        setCheckId(null);
        setItems([]);
        return;
      }

      setCheckId(open.id);
      setItems(await fetchCheckItems(open.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [tid]);

  useEffect(() => {
    void refresh();
  }, [tid, refresh]);

  const productMap = useMemo(() => {
    const m = new Map<string, ProductRow>();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  const subtotal = useMemo(() => {
    let s = 0;
    for (const it of items) s += Number(it.unit_price) * Number(it.qty);
    return s;
  }, [items]);

  const taxRate = 0;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  async function onAdd() {
    if (!checkId) return;
    const p = productMap.get(selectedProductId);
    if (!p) return;

    setError("");
    try {
      await addCheckItem({
        checkId,
        productId: p.id,
        productName: p.name,
        unitPrice: Number(p.price),
        qty: Number(qty),
        note,
      });
      setNote("");
      setQty("1");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    }
  }

  async function onDelete(itemId: string) {
    setError("");
    try {
      await deleteCheckItem(itemId);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    }
  }

  async function onDictate() {
    if (!checkId) return;
    setError("");
    setDictating(true);

    try {
      const { transcript } = await startDictation({ lang: "es-SV" });
      setLastTranscript(transcript);

      const parsed = parseVoiceOrder(transcript, products);

      if (parsed.items.length === 0) {
        setError(parsed.message || "No se detectaron items.");
        return;
      }

      // si hay dudas, pedimos confirmación con modal
      if (parsed.needsConfirmation) {
        setPendingItems(parsed.items);
        return;
      }

      // si es claro, insertamos directo
      for (const it of parsed.items) {
        await addCheckItem({
          checkId,
          productId: it.product.id,
          productName: it.product.name,
          unitPrice: Number(it.product.price),
          qty: it.qty,
          note: it.note,
        });
      }

      await refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error dictando";

      // mensajes comunes del navegador
      if (String(msg).includes("not-allowed")) {
        setError("Permiso denegado: habilita el micrófono para este sitio y vuelve a intentar.");
      } else if (String(msg).includes("no-speech")) {
        setError("No se detectó voz. Habla más cerca del micrófono y vuelve a intentar.");
      } else {
        setError(msg);
      }
    } finally {
      setDictating(false);
    }
  }

  function ConfirmModal() {
    if (!pendingItems || !checkId) return null;

    async function confirmAll() {
      setError("");
      try {
        if (!pendingItems || !checkId) return;
        for (const it of pendingItems) {
          await addCheckItem({
            checkId,
            productId: it.product.id,
            productName: it.product.name,
            unitPrice: Number(it.product.price),
            qty: it.qty,
            note: it.note,
          });
        }
        setPendingItems(null);
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error confirmando");
      }
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl space-y-3">
          <div className="text-lg font-semibold">Confirmar pedido</div>

          <div className="text-sm text-black/70">
            Transcripción: <span className="font-medium">"{lastTranscript}"</span>
          </div>

          <div className="rounded-xl border p-3 space-y-2">
            {pendingItems.map((it, idx) => (
              <div key={idx} className="text-sm">
                <div className="font-medium">
                  {it.qty} × {it.product.name}
                </div>
                {it.note && <div className="text-xs text-black/60">Nota: {it.note}</div>}
                {it.reason && <div className="text-xs text-amber-700">⚠ {it.reason}</div>}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPendingItems(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmAll}>Confirmar y agregar</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Mesa {tid}</h1>
          <p className="text-black/70">
            {checkId ? "Cuenta abierta: puedes agregar items." : "No hay cuenta abierta. Vuelve al POS y abre la cuenta."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/pos">
            <Button variant="ghost">← Volver</Button>
          </Link>
          <Button variant="ghost" onClick={refresh} disabled={loading}>
            {loading ? "Cargando..." : "Refrescar"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {!checkId ? (
        <div className="rounded-2xl border p-4">
          Abre la cuenta de esta mesa en <Link className="underline" to="/pos">/pos</Link> para poder agregar items.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Agregar item */}
          <div className="rounded-2xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Agregar al pedido</div>
              <Button variant="ghost" onClick={onDictate} disabled={!checkId || dictating}>
                {dictating ? "🎙️ Escuchando..." : "🎙️ Dictar pedido"}
              </Button>
            </div>

            <select
              className="w-full rounded-xl border px-3 py-2"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">Selecciona un producto...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ${Number(p.price).toFixed(2)}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <input
                className="rounded-xl border px-3 py-2"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="Cantidad"
              />
              <input
                className="rounded-xl border px-3 py-2"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nota (opcional)"
              />
            </div>

            <Button onClick={onAdd} disabled={!selectedProductId || Number(qty) <= 0}>
              Agregar
            </Button>
          </div>

          {/* Ticket */}
          <div className="rounded-2xl border p-4">
            <div className="font-semibold mb-3">Ticket</div>

            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="text-sm text-black/60">Sin items todavía</div>
              ) : (
                items.map((it) => (
                  <div key={it.id} className="flex items-start justify-between gap-3 border-b pb-2">
                    <div>
                      <div className="text-sm font-medium">
                        {it.qty} × {it.product_name}
                      </div>
                      {it.note && <div className="text-xs text-black/60">Nota: {it.note}</div>}
                      <div className="text-xs text-black/60">
                        ${Number(it.unit_price).toFixed(2)} c/u
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ${(Number(it.unit_price) * Number(it.qty)).toFixed(2)}
                      </div>
                      <button className="text-xs underline text-black/70" onClick={() => onDelete(it.id)}>
                        quitar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-black/60"><span>Impuesto</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      <ConfirmModal />
    </div>
  );
}