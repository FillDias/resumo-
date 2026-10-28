import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";
import type { FiltroSituacao, SituacaoParcela } from "../types";

export function inicioDeHoje() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return hoje;
}

function situacaoDaParcela(parcela: { status: string; dataVencimento: Date }, hoje: Date): SituacaoParcela {
  if (parcela.status === "PAGA") return "PAGA";
  return parcela.dataVencimento < hoje ? "ATRASADA" : "PENDENTE";
}

export async function listarParcelas(filtro: { clienteId?: number; situacao: FiltroSituacao }) {
  const hoje = inicioDeHoje();
  const condicaoPorSituacao: Record<FiltroSituacao, Prisma.ParcelaWhereInput> = {
    todas: {},
    pendentes: { status: { not: "PAGA" }, dataVencimento: { gte: hoje } },
    atrasadas: { status: { not: "PAGA" }, dataVencimento: { lt: hoje } },
    pagas: { status: "PAGA" },
  };

  const parcelas = await prisma.parcela.findMany({
    where: { ...condicaoPorSituacao[filtro.situacao], venda: { clienteId: filtro.clienteId } },
    orderBy: [{ dataVencimento: "asc" }, { numero: "asc" }],
    include: {
      venda: { select: { numeroParcelas: true, dataVenda: true, cliente: { select: { nome: true } } } },
      pagamentos: { select: { dataPagamento: true }, take: 1 },
    },
  });

  return parcelas.map((parcela) => ({
    ...parcela,
    situacao: situacaoDaParcela(parcela, hoje),
    dataPagamento: parcela.pagamentos[0]?.dataPagamento,
  }));
}

export async function registrarPagamentoDaParcela(parcelaId: number, dataPagamento: Date) {
  const parcela = await prisma.parcela.findUniqueOrThrow({ where: { id: parcelaId } });
  if (parcela.status === "PAGA") return;

  await prisma.$transaction([
    prisma.pagamento.create({
      data: { vendaId: parcela.vendaId, parcelaId, valorPago: parcela.valor, dataPagamento },
    }),
    prisma.parcela.update({ where: { id: parcelaId }, data: { status: "PAGA" } }),
  ]);
}
