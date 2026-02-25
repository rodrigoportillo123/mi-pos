import { useEffect, useState } from "react";
import { Button } from "../../shared/ui/Button";
import { createProduct, fetchProducts, updateProduct, addSalvadoranFood } from "./productsApi";
import type { ProductRow } from "./types";

export function ProductsPage() {
  const [items, setItems] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("1.00");
  const [cost, setCost] = useState("0.00");
  const [stock, setStock] = useState("0");
  const [unit, setUnit] = useState("unidad");

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      setItems(await fetchProducts());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function onCreate() {
    setError("");
    try {
      await createProduct({
        name: name.trim(),
        price: Number(price),
        cost: Number(cost),
        stock: Number(stock),
        unit: unit.trim() || "unidad",
      });
      setName("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    }
  }

  async function toggleActive(p: ProductRow) {
    setError("");
    try {
      await updateProduct(p.id, { is_active: !p.is_active });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    }
  }

  async function onAddSalvadoranFood() {
    setError("");
    setLoading(true);
    try {
      await addSalvadoranFood();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error agregando comida típica");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-black/70">CRUD básico para poder armar pedidos.</p>
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

      <div className="rounded-2xl border p-4">
        <div className="font-semibold mb-3">Nuevo producto</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          <input className="rounded-xl border px-3 py-2" placeholder="Nombre" value={name} onChange={(e)=>setName(e.target.value)} />
          <input className="rounded-xl border px-3 py-2" placeholder="Precio" value={price} onChange={(e)=>setPrice(e.target.value)} />
          <input className="rounded-xl border px-3 py-2" placeholder="Costo" value={cost} onChange={(e)=>setCost(e.target.value)} />
          <input className="rounded-xl border px-3 py-2" placeholder="Stock" value={stock} onChange={(e)=>setStock(e.target.value)} />
          <input className="rounded-xl border px-3 py-2" placeholder="Unidad" value={unit} onChange={(e)=>setUnit(e.target.value)} />
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={onCreate} disabled={!name.trim()}>
            Crear
          </Button>
          <Button 
            variant="ghost" 
            onClick={onAddSalvadoranFood} 
            disabled={loading}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? "Agregando..." : "🇸🇻 Agregar Comida Típica SV"}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        <div className="grid grid-cols-12 gap-2 bg-black/5 px-4 py-2 text-xs font-medium">
          <div className="col-span-4">Nombre</div>
          <div className="col-span-2">Precio</div>
          <div className="col-span-2">Costo</div>
          <div className="col-span-2">Stock</div>
          <div className="col-span-2">Estado</div>
        </div>

        {items.map((p) => (
          <div key={p.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-t text-sm items-center">
            <div className="col-span-4">{p.name}</div>
            <div className="col-span-2">${Number(p.price).toFixed(2)}</div>
            <div className="col-span-2">${Number(p.cost).toFixed(2)}</div>
            <div className="col-span-2">{p.stock} {p.unit}</div>
            <div className="col-span-2">
              <Button variant="ghost" onClick={() => toggleActive(p)}>
                {p.is_active ? "Activo" : "Inactivo"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}