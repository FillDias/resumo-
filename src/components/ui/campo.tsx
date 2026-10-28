export function Campo({
  label,
  erro,
  ...props
}: React.ComponentProps<"input"> & { label: string; name: string; erro?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        className={`rounded-lg border px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 ${
          erro ? "border-danger" : "border-border"
        }`}
        {...props}
      />
      {erro && <span className="text-xs text-danger">{erro}</span>}
    </label>
  );
}
