import type { LucideIcon } from "lucide-react";
import { Card } from "./card";

const tons = {
  padrao: { icone: "bg-brand-light text-brand", valor: "" },
  perigo: { icone: "bg-red-100 text-danger", valor: "text-danger" },
};

export function MetricCard({
  label,
  valor,
  detalhe,
  icone: Icone,
  tom = "padrao",
}: {
  label: string;
  valor: string;
  detalhe: string;
  icone: LucideIcon;
  tom?: keyof typeof tons;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span className={`rounded-lg p-2 ${tons[tom].icone}`}>
          <Icone size={20} />
        </span>
      </div>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${tons[tom].valor}`}>{valor}</p>
      <p className="mt-1 text-xs text-muted">{detalhe}</p>
    </Card>
  );
}
