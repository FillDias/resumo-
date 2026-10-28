import Link from "next/link";

const estilos = {
  primario: "bg-brand text-white hover:bg-brand/90",
  secundario: "border border-border text-ink hover:bg-bg",
};

export function LinkButton({
  href,
  variante = "primario",
  children,
}: {
  href: string;
  variante?: keyof typeof estilos;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium ${estilos[variante]}`}
    >
      {children}
    </Link>
  );
}
