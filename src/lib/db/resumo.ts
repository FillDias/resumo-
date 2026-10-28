import { prisma } from "./prisma";
import { inicioDeHoje } from "./parcelas";

function intervaloDoMes(referencia: Date) {
  return {
    gte: new Date(referencia.getFullYear(), referencia.getMonth(), 1),
    lt: new Date(referencia.getFullYear(), referencia.getMonth() + 1, 1),
  };
}

async function buscarVendasERecebimentosDoMes(referencia: Date) {
  const mes = intervaloDoMes(referencia);
  const [vendasPorTipo, recebido] = await Promise.all([
    prisma.venda.groupBy({ by: ["tipo"], where: { dataVenda: mes }, _sum: { valorTotal: true } }),
    prisma.pagamento.aggregate({ where: { dataPagamento: mes }, _sum: { valorPago: true } }),
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
  };
}

export async function buscarResumoDoMes(referencia: Date) {
  const [vendasERecebimentos, emAberto, emAtraso] = await Promise.all([
    buscarVendasERecebimentosDoMes(referencia),
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

  return {
    ...vendasERecebimentos,
    valorEmAberto: emAberto._sum.valor ?? 0,
    parcelasEmAberto: emAberto._count,
    valorEmAtraso: emAtraso._sum.valor ?? 0,
    parcelasEmAtraso: emAtraso._count,
  };
}

export async function buscarFechamentoDoMes(referencia: Date) {
  const hoje = inicioDeHoje();
  const [vendasERecebimentos, parcelasDoMes] = await Promise.all([
    buscarVendasERecebimentosDoMes(referencia),
    prisma.parcela.findMany({
      where: { dataVencimento: intervaloDoMes(referencia) },
      include: { venda: { select: { cliente: { select: { id: true, nome: true } } } } },
    }),
  ]);

  const naoPagas = parcelasDoMes.filter((parcela) => parcela.status !== "PAGA");
  const vencidas = parcelasDoMes.filter((parcela) => parcela.dataVencimento < hoje);
  const vencidasNaoPagas = naoPagas.filter((parcela) => parcela.dataVencimento < hoje);
  const somar = (lista: typeof parcelasDoMes) => lista.reduce((total, parcela) => total + parcela.valor, 0);

  const valorVencido = somar(vencidas);
  const valorInadimplente = somar(vencidasNaoPagas);

  const inadimplentesPorCliente = new Map<number, { nome: string; parcelas: number; valor: number; vencimentoMaisAntigo: Date }>();
  for (const parcela of vencidasNaoPagas) {
    const { id, nome } = parcela.venda.cliente;
    const atual = inadimplentesPorCliente.get(id) ?? { nome, parcelas: 0, valor: 0, vencimentoMaisAntigo: parcela.dataVencimento };
    inadimplentesPorCliente.set(id, {
      nome,
      parcelas: atual.parcelas + 1,
      valor: atual.valor + parcela.valor,
      vencimentoMaisAntigo: parcela.dataVencimento < atual.vencimentoMaisAntigo ? parcela.dataVencimento : atual.vencimentoMaisAntigo,
    });
  }

  return {
    ...vendasERecebimentos,
    valorEmAberto: somar(naoPagas),
    parcelasEmAberto: naoPagas.length,
    valorVencido,
    valorInadimplente,
    taxaDeInadimplencia: valorVencido > 0 ? valorInadimplente / valorVencido : 0,
    inadimplentes: [...inadimplentesPorCliente.entries()]
      .map(([clienteId, dados]) => ({ clienteId, ...dados }))
      .sort((a, b) => b.valor - a.valor),
  };
}
