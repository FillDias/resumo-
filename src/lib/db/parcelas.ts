import { prisma } from "./prisma";

export async function registrarPagamentoDaParcela(parcelaId: number, dataPagamento: Date) {
  const parcela = await prisma.parcela.findUniqueOrThrow({ where: { id: parcelaId } });

  await prisma.$transaction([
    prisma.pagamento.create({
      data: { vendaId: parcela.vendaId, parcelaId, valorPago: parcela.valor, dataPagamento },
    }),
    prisma.parcela.update({ where: { id: parcelaId }, data: { status: "PAGA" } }),
  ]);
}
