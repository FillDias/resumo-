export function Tabela({ colunas, children }: { colunas: { titulo: string; numerica?: boolean }[]; children: React.ReactNode }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border text-xs uppercase text-muted">
          {colunas.map(({ titulo, numerica }) => (
            <th key={titulo} className={`px-3 py-2 font-medium ${numerica ? "text-right" : "text-left"}`}>
              {titulo}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export function Linha({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-border last:border-0 hover:bg-bg">{children}</tr>;
}

export function Celula({
  children,
  numerica,
  className = "",
}: {
  children: React.ReactNode;
  numerica?: boolean;
  className?: string;
}) {
  return (
    <td className={`px-3 py-3 ${numerica ? "text-right tabular-nums" : ""} ${className}`}>{children}</td>
  );
}
