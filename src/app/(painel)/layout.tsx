import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { usuarioLogado } from "@/lib/auth/sessao";
import { formatarCnpj } from "@/lib/cnpj";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar
        conta={
          <Suspense fallback={null}>
            <ContaLogada />
          </Suspense>
        }
      />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl p-8">{children}</div>
      </main>
    </div>
  );
}

async function ContaLogada() {
  const usuario = await usuarioLogado();
  return (
    <div className="min-w-0">
      <p className="truncate font-medium">{usuario.email}</p>
      <p className="text-xs text-muted">CNPJ {formatarCnpj(usuario.cnpj)}</p>
    </div>
  );
}
