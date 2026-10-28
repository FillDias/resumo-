import type { SituacaoParcela } from "@/lib/types";

const aparencia: Record<SituacaoParcela, { texto: string; estilo: string }> = {
  PAGA: { texto: "Paga", estilo: "bg-green-100 text-green-700" },
  PENDENTE: { texto: "Pendente", estilo: "bg-amber-100 text-amber-700" },
  ATRASADA: { texto: "Atrasada", estilo: "bg-red-100 text-red-700" },
};

export function StatusBadge({ situacao }: { situacao: SituacaoParcela }) {
  const { texto, estilo } = aparencia[situacao];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${estilo}`}>{texto}</span>;
}
