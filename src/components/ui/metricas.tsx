type Metrica = { label: string; valor: string; detalhe: string; destaqueDePerigo?: boolean };

export function Metricas({ itens }: { itens: Metrica[] }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
      {itens.map(({ label, valor, detalhe, destaqueDePerigo }) => (
        <div key={label} className="bg-surface p-5 sm:p-6">
          <p className="text-sm text-muted">{label}</p>
          <p
            className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl ${
              destaqueDePerigo ? "text-danger" : ""
            }`}
          >
            {valor}
          </p>
          <p className="mt-1 text-xs text-muted">{detalhe}</p>
        </div>
      ))}
    </div>
  );
}
