import { prisma } from "./prisma";
import { inicioDeHoje } from "./parcelas";

export async function buscarResumoDoMes(referencia: Date) {
  const inicioDoMes = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
  const inicioDoProximoMes = new Date(referencia.getFullYear(), referencia.getMonth() + 1, 1);

  const [vendasPorTipo, recebido, emAberto, emAtraso] = await Promise.all([
    prisma.venda.groupBy({
      by: ["tipo"],
      where: { dataVenda: { gte: inicioDoMes, lt: inicioDoProximoMes } },
      _sum: { valorTotal: true },
    }),
    prisma.pagamento.aggregate({
      where: { dataPagamento: { gte: inicioDoMes, lt: inicioDoProximoMes } },
      _sum: { valorPago: true },
    }),
    prisma.parcela.aggregate({
      where: { status: { not: "PAGA" } },
      _sum: { valor: true },
      _count: true,
    }),
    prisma.parcela.aggregate({
      where: { status: { not: "PAGA" }, dataVencimento: { lt: inicioDeHoje() } },
      _sum: { valor: true },
      _count: true,
    }),
  ]);

  const totalDoTipo = (tipo: "AVISTA" | "PARCELADA") =>
    vendasPorTipo.find((grupo) => grupo.tipo === tipo)?._sum.valorTotal ?? 0;
  const vendidoAVista = totalDoTipo("AVISTA");
  const vendidoParcelado = totalDoTipo("PARCELADA");

  return {
    vendidoAVista,
    vendidoParcelado,
    totalVendido: vendidoAVista + vendidoParcelado,
    totalRecebido: recebido._sum.valorPago ?? 0,
    valorEmAberto: emAberto._sum.valor ?? 0,
    parcelasEmAberto: emAberto._count,
    valorEmAtraso: emAtraso._sum.valor ?? 0,
    parcelasEmAtraso: emAtraso._count,
  };
}
