export default function AcessoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <span className="text-3xl font-semibold text-brand-dark">Resumo+</span>
        <p className="mt-1 text-muted">Controle financeiro de vendas</p>
      </div>
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-sm">{children}</div>
    </div>
  );
}
