"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  FileChartColumn,
  LayoutDashboard,
  ShoppingCart,
  Users,
} from "lucide-react";

const itensMenu = [
  { href: "/", label: "Dashboard", icone: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icone: Users },
  { href: "/vendas", label: "Vendas", icone: ShoppingCart },
  { href: "/parcelas", label: "Parcelas", icone: CalendarClock },
  { href: "/relatorio", label: "Relatório", icone: FileChartColumn },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 flex w-60 flex-col border-r border-border bg-surface">
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
    </aside>
  );
}
