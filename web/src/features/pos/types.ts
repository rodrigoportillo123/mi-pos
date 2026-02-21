export type TableRow = {
  id: number;
  name: string;
};

export type CheckStatus = "open" | "closed" | "paid";

export type CheckRow = {
  id: string;
  table_id: number;
  status: CheckStatus;
  opened_at: string;
  closed_at: string | null;
  paid_at: string | null;
};