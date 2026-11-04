import Link from "next/link";

const estiloBase =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 font-medium disabled:opacity-60";

const estilos = {
  primario: "bg-brand text-white hover:bg-brand/90",
  secundario: "border border-border bg-surface text-ink hover:bg-bg",
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
  className = "",
  children,
}: {
  href: string;
  variante?: Variante;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${estiloBase} ${estilos[variante]} ${className}`}>
      {children}
    </Link>
  );
}
