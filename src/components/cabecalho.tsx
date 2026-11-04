"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  FileChartColumn,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { sair } from "@/app/(auth)/actions";

const itensMenu = [
  { href: "/", label: "Dashboard", icone: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icone: Users },
  { href: "/vendas", label: "Vendas", icone: ShoppingCart },
  { href: "/parcelas", label: "Parcelas", icone: CalendarClock },
  { href: "/relatorio", label: "Relatório", icone: FileChartColumn },
];

function BotaoSair() {
  return (
    <form action={sair}>
      <button type="submit" title="Sair" aria-label="Sair" className="rounded-lg p-2 text-muted hover:bg-bg hover:text-ink">
        <LogOut size={18} />
      </button>
    </form>
  );
}

export function Cabecalho({ conta }: { conta: React.ReactNode }) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const estaAtivo = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Resumo<span className="text-brand">+</span>
        </Link>

        <nav className="hidden h-full items-center gap-6 lg:flex">
          {itensMenu.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex h-full items-center border-b-2 font-medium ${
                estaAtivo(href) ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          {conta}
          <BotaoSair />
        </div>

        <button
          type="button"
          onClick={() => setMenuAberto(!menuAberto)}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          className="ml-auto rounded-lg p-2 text-muted hover:bg-bg hover:text-ink lg:hidden"
        >
          {menuAberto ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuAberto && (
        <div className="border-t border-border px-4 pb-4 pt-2 sm:px-6 lg:hidden">
          <nav className="flex flex-col gap-1">
            {itensMenu.map(({ href, label, icone: Icone }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuAberto(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium ${
                  estaAtivo(href) ? "bg-brand-light text-brand" : "text-muted hover:bg-bg hover:text-ink"
                }`}
              >
                <Icone size={18} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
            {conta}
            <BotaoSair />
          </div>
        </div>
      )}
    </header>
  );
}
