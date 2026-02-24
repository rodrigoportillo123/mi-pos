import { supabase } from "../../lib/supabaseClient";
import type { ProductRow } from "../products/types";

export type InventoryMovementRow = {
  id: string;
  product_id: string;
  reason: "restock" | "sale" | "waste" | "adjustment";
  qty_change: number;
  ref_check_id: string | null;
  note: string | null;
  created_at: string;
};

export async function fetchProductsForInventory(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,cost,stock,unit,is_active")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ProductRow[];
}

export async function fetchMovements(limit = 50): Promise<InventoryMovementRow[]> {
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("id,product_id,reason,qty_change,ref_check_id,note,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as InventoryMovementRow[];
}

export async function addMovement(input: {
  productId: string;
  reason: "restock" | "waste" | "adjustment";
  qtyChange: number; // + entrada, - salida
  note?: string;
}): Promise<void> {
  const { error } = await supabase.rpc("apply_inventory_movement", {
    p_product_id: input.productId,
    p_reason: input.reason,
    p_qty_change: input.qtyChange,
    p_note: input.note ?? "",
  });

  if (error) throw new Error(error.message);


  // Actualizar stock en products
  const { error: err2 } = await supabase
    .from("products")
    .update({ /* stock = stock + qtyChange */ })
    .eq("id", input.productId);

  // No podemos hacer "stock = stock + qty" directo sin RPC; lo hacemos con RPC simple en Fase 5.4
  // Por ahora lo dejamos y lo resolvemos abajo con una función SQL.
  if (err2) {
    // No lanzamos aquí para no romper; lo arreglamos con RPC en el siguiente paso.
  }
}