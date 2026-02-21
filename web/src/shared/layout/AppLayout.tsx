import { Link, Outlet, useLocation } from "react-router-dom";

function NavLink({ to, label }: { to: string; label: string }) {
  const { pathname } = useLocation();
  const active = pathname === to;

  return (
    <Link
      to={to}
      className={[
        "rounded-xl px-3 py-2 text-sm",
        active ? "bg-black text-white" : "hover:bg-black/5",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <div className="font-semibold">POS Restaurante</div>
          <nav className="flex gap-2">
            <NavLink to="/" label="Inicio" />
            <NavLink to="/supabase-test" label="Test Supabase" />
            <NavLink to="/pos" label="POS" />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
