"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  FileChartColumn,
  LayoutDashboard,
  LogOut,
  ShoppingCart,
  Users,
} from "lucide-react";
import { sair } from "@/app/(auth)/actions";

const itensMenu = [
  { href: "/", label: "Dashboard", icone: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icone: Users },
  { href: "/vendas", label: "Vendas", icone: ShoppingCart },
  { href: "/parcelas", label: "Parcelas", icone: CalendarClock },
  { href: "/relatorio", label: "Relatório", icone: FileChartColumn },
];

export function Sidebar({ conta }: { conta: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-surface">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="bg-brand-dark px-6 py-5">
          <span className="text-xl font-semibold text-white">Resumo+</span>
          <p className="text-xs text-white/70">Controle financeiro de vendas</p>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {itensMenu.map(({ href, label, icone: Icone }) => {
            const ativo = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 font-medium ${
                  ativo ? "bg-brand-light text-brand" : "text-muted hover:bg-bg hover:text-ink"
                }`}
              >
                <Icone size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border p-4">
          {conta}
          <form action={sair}>
            <button
              type="submit"
              title="Sair"
              aria-label="Sair"
              className="rounded-lg p-2 text-muted hover:bg-bg hover:text-ink"
            >
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
