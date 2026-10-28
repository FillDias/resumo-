import type { TipoVenda } from "@prisma/client";

export type NovaVenda = {
  clienteId: number;
  vendedorId: number;
  tipo: TipoVenda;
  valorTotal: number;
  numeroParcelas?: number;
  dataVenda: Date;
};

export type SituacaoParcela = "PAGA" | "PENDENTE" | "ATRASADA";

export const filtrosDeSituacao = ["todas", "pendentes", "atrasadas", "pagas"] as const;

export type FiltroSituacao = (typeof filtrosDeSituacao)[number];
