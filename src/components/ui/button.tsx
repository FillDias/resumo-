import Link from "next/link";

const estiloBase = "inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium disabled:opacity-60";

const estilos = {
  primario: "bg-brand text-white hover:bg-brand/90",
  secundario: "border border-border text-ink hover:bg-bg",
};

type Variante = keyof typeof estilos;

export function Button({
  variante = "primario",
  className = "",
  ...props
}: React.ComponentProps<"button"> & { variante?: Variante }) {
  return <button className={`${estiloBase} ${estilos[variante]} ${className}`} {...props} />;
}

export function LinkButton({
  href,
  variante = "primario",
  children,
}: {
  href: string;
  variante?: Variante;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${estiloBase} ${estilos[variante]}`}>
      {children}
    </Link>
  );
}
