import { Suspense } from "react";
import { Cabecalho } from "@/components/cabecalho";
import { usuarioLogado } from "@/lib/auth/sessao";
import { formatarCnpj } from "@/lib/cnpj";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Cabecalho
        conta={
          <Suspense fallback={null}>
            <ContaLogada />
          </Suspense>
        }
      />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">{children}</main>
    </>
  );
}

async function ContaLogada() {
  const usuario = await usuarioLogado();
  return (
    <div className="min-w-0 lg:max-w-56 lg:text-right">
      <p className="truncate text-sm font-medium">{usuario.email}</p>
      <p className="text-xs text-muted">CNPJ {formatarCnpj(usuario.cnpj)}</p>
    </div>
  );
}
