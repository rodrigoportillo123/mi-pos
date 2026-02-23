import { supabase } from "../../lib/supabaseClient";
import type { ProductRow } from "./types";

export async function fetchProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id,name,price,cost,stock,unit,is_active")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ProductRow[];
}

export async function createProduct(input: {
  name: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
}): Promise<void> {
  const { error } = await supabase.from("products").insert([{
    name: input.name,
    price: input.price,
    cost: input.cost,
    stock: input.stock,
    unit: input.unit,
    is_active: true,
  }]);

  if (error) throw new Error(error.message);
}

export async function updateProduct(id: string, patch: Partial<{
  name: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
  is_active: boolean;
}>): Promise<void> {
  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
}