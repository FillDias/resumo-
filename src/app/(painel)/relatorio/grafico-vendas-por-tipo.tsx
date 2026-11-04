import { formatarMoeda, formatarPercentual } from "@/lib/format";

// Com r = 15.9155 a circunferência mede 100, então cada fatia usa direto o seu percentual no stroke-dasharray.
const RAIO = 15.9155;
const ESPACO_ENTRE_FATIAS = 0.6;

export function GraficoVendasPorTipo({ aVista, parcelado }: { aVista: number; parcelado: number }) {
  const total = aVista + parcelado;
  if (total === 0) return <p className="py-6 text-center text-muted">Nenhuma venda neste mês.</p>;

  const fatias = [
    { label: "À vista", valor: aVista, cor: "var(--color-brand)", classeDaCor: "bg-brand" },
    { label: "Parcelado", valor: parcelado, cor: "var(--color-chart-2)", classeDaCor: "bg-chart-2" },
  ].map((fatia) => ({ ...fatia, percentual: (fatia.valor / total) * 100 }));
  const espaco = fatias.every((fatia) => fatia.valor > 0) ? ESPACO_ENTRE_FATIAS : 0;

  let inicioDaFatia = 0;
  const arcos = fatias.map((fatia) => {
    const comprimento = Math.max(fatia.percentual - espaco, 0);
    const deslocamento = -inicioDaFatia;
    inicioDaFatia += fatia.percentual;
    return { ...fatia, comprimento, deslocamento };
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row lg:flex-col">
      <div className="relative size-40 shrink-0">
        <svg viewBox="0 0 42 42" className="size-full -rotate-90" role="img" aria-label="Vendas do mês por tipo">
          {arcos.map((arco) => (
            <circle
              key={arco.label}
              cx="21"
              cy="21"
              r={RAIO}
              fill="none"
              stroke={arco.cor}
              strokeWidth="5"
              strokeDasharray={`${arco.comprimento} ${100 - arco.comprimento}`}
              strokeDashoffset={arco.deslocamento}
            >
              <title>{`${arco.label}: ${formatarMoeda(arco.valor)} (${formatarPercentual(arco.percentual / 100)})`}</title>
            </circle>
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted">Total</span>
          <span className="text-sm font-semibold tabular-nums">{formatarMoeda(total)}</span>
        </div>
      </div>

      <ul className="flex w-full flex-col gap-3 sm:max-w-xs lg:max-w-none">
        {fatias.map((fatia) => (
          <li key={fatia.label} className="flex items-center gap-3">
            <span className={`size-2.5 shrink-0 rounded-full ${fatia.classeDaCor}`} />
            <span className="flex-1">{fatia.label}</span>
            <span className="text-right">
              <span className="block font-semibold tabular-nums">{formatarMoeda(fatia.valor)}</span>
              <span className="block text-xs text-muted tabular-nums">{formatarPercentual(fatia.percentual / 100)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
