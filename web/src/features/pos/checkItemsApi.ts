import { supabase } from "../../lib/supabaseClient";

export type CheckItemRow = {
  id: string;
  check_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  qty: number;
  note: string | null;
  created_at: string;
};

export async function fetchCheckItems(checkId: string): Promise<CheckItemRow[]> {
  const { data, error } = await supabase
    .from("check_items")
    .select("id,check_id,product_id,product_name,unit_price,qty,note,created_at")
    .eq("check_id", checkId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as CheckItemRow[];
}

export async function addCheckItem(input: {
  checkId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  qty: number;
  note?: string;
}): Promise<void> {
  const { error } = await supabase.from("check_items").insert([{
    check_id: input.checkId,
    product_id: input.productId,
    product_name: input.productName,
    unit_price: input.unitPrice,
    qty: input.qty,
    note: input.note?.trim() || null,
  }]);

  if (error) throw new Error(error.message);
}

export async function deleteCheckItem(itemId: string): Promise<void> {
  const { error } = await supabase.from("check_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);
}