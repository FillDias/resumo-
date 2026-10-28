import type { LucideIcon } from "lucide-react";
import { Card } from "./card";

export function MetricCard({
  label,
  valor,
  detalhe,
  icone: Icone,
}: {
  label: string;
  valor: string;
  detalhe: string;
  icone: LucideIcon;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span className="rounded-lg bg-brand-light p-2 text-brand">
          <Icone size={20} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{valor}</p>
      <p className="mt-1 text-xs text-muted">{detalhe}</p>
    </Card>
  );
}
