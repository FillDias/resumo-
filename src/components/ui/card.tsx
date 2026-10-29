export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-surface p-5 sm:p-6 ${className}`}>{children}</div>;
}
