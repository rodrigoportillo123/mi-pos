import { supabase } from "../../lib/supabaseClient";
import type { CheckRow, TableRow } from "./types";

export async function fetchTables(): Promise<TableRow[]> {
  const { data, error } = await supabase
    .from("tables")
    .select("id,name")
    .order("id", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchOpenChecks(): Promise<CheckRow[]> {
  const { data, error } = await supabase
    .from("checks")
    .select("id,table_id,status,opened_at,closed_at,paid_at")
    .eq("status", "open");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function openCheck(tableId: number): Promise<CheckRow> {
  // Crear un check OPEN para esa mesa
  const { data, error } = await supabase
    .from("checks")
    .insert([{ table_id: tableId, status: "open" }])
    .select("id,table_id,status,opened_at,closed_at,paid_at")
    .single();

  if (error) throw new Error(error.message);
  return data as CheckRow;
}

export async function closeCheck(checkId: string): Promise<void> {
  const { error } = await supabase.rpc("close_check_and_post", {
    p_check_id: checkId,
  });

  if (error) throw new Error(error.message);
}