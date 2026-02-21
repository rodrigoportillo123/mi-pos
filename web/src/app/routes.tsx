import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../shared/layout/AppLayout";
import { HomePage } from "../features/home/HomePage";
import { SupabaseTestPage } from "../features/supabase-test/SupabaseTestPage";
import { PosPage } from "../features/pos/PosPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/supabase-test", element: <SupabaseTestPage /> },
      { path: "/pos", element: <PosPage /> },
    ],
  },
]);