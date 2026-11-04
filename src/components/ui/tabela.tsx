export function Tabela({ colunas, children }: { colunas: { titulo: string; numerica?: boolean }[]; children: React.ReactNode }) {
  return (
    <table className="block w-full md:table">
      <thead className="hidden md:table-header-group">
        <tr className="border-b border-border text-xs text-muted">
          {colunas.map(({ titulo, numerica }) => (
            <th key={titulo} className={`px-3 py-2 font-medium ${numerica ? "text-right" : "text-left"}`}>
              {titulo}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="block md:table-row-group">{children}</tbody>
    </table>
  );
}

export function Linha({ children }: { children: React.ReactNode }) {
  return (
    <tr className="block border-b border-border py-3 last:border-0 md:table-row md:py-0 md:hover:bg-bg">{children}</tr>
  );
}

// No celular a tabela vira lista: cada célula mostra o nome da coluna (data-rotulo) à esquerda do valor.
export function Celula({
  rotulo,
  children,
  numerica,
  className = "",
}: {
  rotulo: string;
  children: React.ReactNode;
  numerica?: boolean;
  className?: string;
}) {
  return (
    <td
      data-rotulo={rotulo}
      className={`flex items-center justify-between gap-4 py-1 text-right before:text-xs before:font-normal before:text-muted before:content-[attr(data-rotulo)] md:table-cell md:px-3 md:py-3 md:before:content-none ${
        numerica ? "tabular-nums" : "md:text-left"
      } ${className}`}
    >
      {children}
    </td>
  );
}
