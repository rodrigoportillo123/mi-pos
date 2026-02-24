import { supabase } from "../../lib/supabaseClient";

export type SaleRow = {
  id: string;
  check_id: string;
  table_id: number;
  subtotal: number;
  tax: number;
  total: number;
  cogs: number;
  gross_profit: number;
  created_at: string;
};

export type InvMovementRow = {
  id: string;
  product_id: string;
  reason: "restock" | "sale" | "waste" | "adjustment";
  qty_change: number;
  ref_check_id: string | null;
  note: string | null;
  created_at: string;
};

// ventas en rango
export async function fetchSalesRange(fromISO: string, toISO: string): Promise<SaleRow[]> {
  const { data, error } = await supabase
    .from("sales")
    .select("id,check_id,table_id,subtotal,tax,total,cogs,gross_profit,created_at")
    .gte("created_at", fromISO)
    .lt("created_at", toISO)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as SaleRow[];
}

// merma en rango (waste). Para pérdidas por merma en dinero necesitaríamos costo por producto.
// En esta fase: lo reportamos como cantidad total de merma (y opcionalmente luego lo valorizamos).
export async function fetchWasteMovementsRange(fromISO: string, toISO: string): Promise<InvMovementRow[]> {
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("id,product_id,reason,qty_change,ref_check_id,note,created_at")
    .eq("reason", "waste")
    .gte("created_at", fromISO)
    .lt("created_at", toISO)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as InvMovementRow[];
}