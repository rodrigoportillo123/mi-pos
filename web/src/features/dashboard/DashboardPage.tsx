import { useEffect, useMemo, useState } from "react";
import { Button } from "../../shared/ui/Button";
import { fetchSalesRange, fetchWasteMovementsRange, type SaleRow } from "./dashboardApi";
import { addDays, formatDayKey, startOfDayLocal, startOfMonthLocal, toISO, type Preset } from "./dateUtils";

type DayAgg = {
  day: string; // YYYY-MM-DD
  sales: number;
  cogs: number;
  profit: number;
  orders: number;
};

function sum(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0);
}

export function DashboardPage() {
  const [preset, setPreset] = useState<Preset>("today");

  // Fechas custom en input type=date (YYYY-MM-DD)
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    return formatDayKey(d);
  });
  const [toDate, setToDate] = useState<string>(() => {
    const d = addDays(new Date(), 1);
    return formatDayKey(d);
  });

  const [sales, setSales] = useState<SaleRow[]>([]);
  const [wasteCount, setWasteCount] = useState<number>(0); // cantidad total (absoluta)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function computeRange(): { from: Date; to: Date } {
    const now = new Date();
    if (preset === "today") {
      const from = startOfDayLocal(now);
      const to = addDays(from, 1);
      return { from, to };
    }
    if (preset === "last7") {
      const to = addDays(startOfDayLocal(now), 1);
      const from = addDays(to, -7);
      return { from, to };
    }
    if (preset === "thisMonth") {
      const from = startOfMonthLocal(now);
      const to = addDays(startOfDayLocal(now), 1);
      return { from, to };
    }
    // custom
    const from = new Date(`${fromDate}T00:00:00`);
    const to = new Date(`${toDate}T00:00:00`);
    return { from, to };
  }

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const { from, to } = computeRange();
      const [s, w] = await Promise.all([
        fetchSalesRange(toISO(from), toISO(to)),
        fetchWasteMovementsRange(toISO(from), toISO(to)),
      ]);
      setSales(s);

      // Merma: sumamos qty_change en negativo (convertimos a positivo para “cantidad desperdiciada”)
      const waste = w.reduce((acc, m) => acc + Math.abs(Number(m.qty_change)), 0);
      setWasteCount(waste);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]); // cuando cambia preset recargamos

  const daily: DayAgg[] = useMemo(() => {
    const map = new Map<string, DayAgg>();

    for (const s of sales) {
      const d = new Date(s.created_at);
      const key = formatDayKey(d);
      const row = map.get(key) ?? { day: key, sales: 0, cogs: 0, profit: 0, orders: 0 };
      row.sales += Number(s.total);
      row.cogs += Number(s.cogs);
      row.profit += Number(s.gross_profit);
      row.orders += 1;
      map.set(key, row);
    }

    return Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day));
  }, [sales]);

  const totals = useMemo(() => {
    const totalSales = sum(daily.map(d => d.sales));
    const totalCogs = sum(daily.map(d => d.cogs));
    const totalProfit = sum(daily.map(d => d.profit));
    const orders = sum(daily.map(d => d.orders));
    return { totalSales, totalCogs, totalProfit, orders };
  }, [daily]);

  const maxSales = useMemo(() => {
    return Math.max(1, ...daily.map(d => d.sales));
  }, [daily]);

  function MetricCard(props: { title: string; value: string; sub?: string }) {
    return (
      <div className="rounded-2xl border p-4">
        <div className="text-sm text-black/60">{props.title}</div>
        <div className="mt-1 text-2xl font-semibold">{props.value}</div>
        {props.sub && <div className="mt-1 text-xs text-black/60">{props.sub}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-black/70">Ventas, costos y ganancia bruta por rango de fechas.</p>
        </div>
        <Button variant="ghost" onClick={refresh} disabled={loading}>
          {loading ? "Cargando..." : "Refrescar"}
        </Button>
      </div>

      {/* Filtros */}
      <div className="rounded-2xl border p-4 space-y-3">
        <div className="font-semibold">Filtros</div>

        <div className="flex flex-wrap gap-2">
          <Button variant={preset === "today" ? "primary" : "ghost"} onClick={() => setPreset("today")}>
            Hoy
          </Button>
          <Button variant={preset === "last7" ? "primary" : "ghost"} onClick={() => setPreset("last7")}>
            Últimos 7 días
          </Button>
          <Button variant={preset === "thisMonth" ? "primary" : "ghost"} onClick={() => setPreset("thisMonth")}>
            Este mes
          </Button>
          <Button variant={preset === "custom" ? "primary" : "ghost"} onClick={() => setPreset("custom")}>
            Personalizado
          </Button>
        </div>

        {preset === "custom" && (
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <div className="text-xs text-black/60 mb-1">Desde</div>
              <input className="rounded-xl border px-3 py-2" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-black/60 mb-1">Hasta</div>
              <input className="rounded-xl border px-3 py-2" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <Button onClick={refresh} disabled={loading}>
              Aplicar
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Ventas" value={`$${totals.totalSales.toFixed(2)}`} sub={`Órdenes: ${totals.orders}`} />
        <MetricCard title="COGS (Costo ventas)" value={`$${totals.totalCogs.toFixed(2)}`} />
        <MetricCard title="Ganancia bruta" value={`$${totals.totalProfit.toFixed(2)}`} />
        <MetricCard title="Merma (cantidad)" value={`${wasteCount.toFixed(3)}`} sub="(valor en $ lo hacemos en Fase 6.2)" />
      </div>

      {/* Gráfica simple */}
      <div className="rounded-2xl border p-4">
        <div className="font-semibold mb-3">Ventas por día (barras)</div>

        {daily.length === 0 ? (
          <div className="text-sm text-black/60">No hay ventas en este rango.</div>
        ) : (
          <div className="space-y-2">
            {daily.map((d) => {
              const pct = Math.round((d.sales / maxSales) * 100);
              return (
                <div key={d.day} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3 text-xs text-black/70">{d.day}</div>
                  <div className="col-span-7">
                    <div className="h-3 rounded-full bg-black/10 overflow-hidden">
                      <div className="h-3 bg-black/60" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="col-span-2 text-right text-xs font-medium">${d.sales.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="rounded-2xl border overflow-hidden">
        <div className="grid grid-cols-12 gap-2 bg-black/5 px-4 py-2 text-xs font-medium">
          <div className="col-span-3">Día</div>
          <div className="col-span-3 text-right">Ventas</div>
          <div className="col-span-3 text-right">COGS</div>
          <div className="col-span-3 text-right">Ganancia</div>
        </div>

        {daily.map((d) => (
          <div key={d.day} className="grid grid-cols-12 gap-2 px-4 py-3 border-t text-sm">
            <div className="col-span-3">{d.day}</div>
            <div className="col-span-3 text-right">${d.sales.toFixed(2)}</div>
            <div className="col-span-3 text-right">${d.cogs.toFixed(2)}</div>
            <div className="col-span-3 text-right font-medium">${d.profit.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}