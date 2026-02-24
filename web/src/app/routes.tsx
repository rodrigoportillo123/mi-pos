import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../shared/layout/AppLayout";
import { HomePage } from "../features/home/HomePage";
import { SupabaseTestPage } from "../features/supabase-test/SupabaseTestPage";
import { PosPage } from "../features/pos/PosPage";
import { ProductsPage } from "../features/products/ProductsPage";
import { TableDetailPage } from "../features/pos/TableDetailPage";
import { InventoryPage } from "../features/inventory/InventoryPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/supabase-test", element: <SupabaseTestPage /> },
      { path: "/pos", element: <PosPage /> },
      { path: "/products", element: <ProductsPage /> },
      { path: "/pos/:tableId", element: <TableDetailPage /> },
      { path: "/inventory", element: <InventoryPage /> },
      { path: "/dashboard", element: <DashboardPage /> },
    ],
  },
]);