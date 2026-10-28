import type { TipoVenda } from "@prisma/client";

export type NovaVenda = {
  clienteId: number;
  vendedorId: number;
  tipo: TipoVenda;
  valorTotal: number;
  numeroParcelas?: number;
  dataVenda: Date;
};
