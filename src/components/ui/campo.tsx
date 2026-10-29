const estiloCampo =
  "h-10 w-full min-w-0 rounded-lg border bg-surface px-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

function Rotulo({ label, erro, children }: { label: string; erro?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {erro && <span className="text-xs text-danger">{erro}</span>}
    </label>
  );
}

export function Campo({
  label,
  erro,
  ...props
}: React.ComponentProps<"input"> & { label: string; name: string; erro?: string }) {
  return (
    <Rotulo label={label} erro={erro}>
      <input className={`${estiloCampo} ${erro ? "border-danger" : "border-border"}`} {...props} />
    </Rotulo>
  );
}

export function CampoSelect({
  label,
  erro,
  opcoes,
  placeholder,
  ...props
}: React.ComponentProps<"select"> & {
  label: string;
  name: string;
  erro?: string;
  placeholder?: string;
  opcoes: { id: number | string; nome: string }[];
}) {
  return (
    <Rotulo label={label} erro={erro}>
      <select className={`${estiloCampo} ${erro ? "border-danger" : "border-border"}`} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {opcoes.map((opcao) => (
          <option key={opcao.id} value={opcao.id}>
            {opcao.nome}
          </option>
        ))}
      </select>
    </Rotulo>
  );
}
