import { Button } from "../../shared/ui/Button";

export function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Base UI lista ✅</h1>
      <p className="text-black/70">
        En Fase 2 construiremos las 12 mesas, estados (abierta/cerrada/pagada) y apertura/cierre de cuenta.
      </p>
      <Button onClick={() => alert("UI funcionando")}>Probar UI</Button>
    </div>
  );
}