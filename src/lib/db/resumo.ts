import type { TipoVenda } from "@prisma/client";
import { prisma } from "./prisma";
import { inicioDeHoje } from "./parcelas";
import type { OrdemDeValor } from "../types";

const LIMITE_DE_MAIORES_CLIENTES = 5;

function intervaloDoMes(referencia: Date) {
  return {
    gte: new Date(referencia.getFullYear(), referencia.getMonth(), 1),
    lt: new Date(referencia.getFullYear(), referencia.getMonth() + 1, 1),
  };
}

async function buscarVendasERecebimentosDoMes(usuarioId: number, referencia: Date) {
  const mes = intervaloDoMes(referencia);
  const [vendasPorTipo, recebido] = await Promise.all([
    prisma.venda.groupBy({ by: ["tipo"], where: { dataVenda: mes, cliente: { usuarioId } }, _sum: { valorTotal: true } }),
    prisma.pagamento.aggregate({ where: { dataPagamento: mes, venda: { cliente: { usuarioId } } }, _sum: { valorPago: true } }),
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

export async function buscarResumoDoMes(usuarioId: number, referencia: Date) {
  const [vendasERecebimentos, emAberto, emAtraso] = await Promise.all([
    buscarVendasERecebimentosDoMes(usuarioId, referencia),
    prisma.parcela.aggregate({
      where: { status: { not: "PAGA" }, venda: { cliente: { usuarioId } } },
      _sum: { valor: true },
      _count: true,
    }),
    prisma.parcela.aggregate({
      where: { status: { not: "PAGA" }, dataVencimento: { lt: inicioDeHoje() }, venda: { cliente: { usuarioId } } },
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

export async function buscarFechamentoDoMes(usuarioId: number, referencia: Date) {
  const hoje = inicioDeHoje();
  const [vendasERecebimentos, parcelasDoMes] = await Promise.all([
    buscarVendasERecebimentosDoMes(usuarioId, referencia),
    prisma.parcela.findMany({
      where: { dataVencimento: intervaloDoMes(referencia), venda: { cliente: { usuarioId } } },
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

async function incluirNomeDosClientes(
  usuarioId: number,
  compras: { clienteId: number; _count: number; _sum: { valorTotal: number | null } }[],
) {
  const clientes = await prisma.cliente.findMany({
    where: { usuarioId, id: { in: compras.map((compra) => compra.clienteId) } },
    select: { id: true, nome: true },
  });
  const nomePorId = new Map(clientes.map((cliente) => [cliente.id, cliente.nome]));

  return compras.map((compra) => ({
    clienteId: compra.clienteId,
    nome: nomePorId.get(compra.clienteId)!,
    quantidadeDeCompras: compra._count,
    valorComprado: compra._sum.valorTotal ?? 0,
  }));
}

export async function listarComprasPorClienteNoMes(
  usuarioId: number,
  referencia: Date,
  filtro: { tipo?: TipoVenda; ordem: OrdemDeValor },
) {
  const compras = await prisma.venda.groupBy({
    by: ["clienteId"],
    where: { dataVenda: intervaloDoMes(referencia), tipo: filtro.tipo, cliente: { usuarioId } },
    _count: true,
    _sum: { valorTotal: true },
    orderBy: { _sum: { valorTotal: filtro.ordem === "maior" ? "desc" : "asc" } },
  });

  return incluirNomeDosClientes(usuarioId, compras);
}

export async function listarMaioresClientesDoAno(usuarioId: number, ano: number) {
  const doAno = { dataVenda: { gte: new Date(ano, 0, 1), lt: new Date(ano + 1, 0, 1) }, cliente: { usuarioId } };
  const [compras, totalDoAno] = await Promise.all([
    prisma.venda.groupBy({
      by: ["clienteId"],
      where: doAno,
      _count: true,
      _sum: { valorTotal: true },
      orderBy: { _sum: { valorTotal: "desc" } },
      take: LIMITE_DE_MAIORES_CLIENTES,
    }),
    prisma.venda.aggregate({ where: doAno, _sum: { valorTotal: true } }),
  ]);

  return {
    totalVendidoNoAno: totalDoAno._sum.valorTotal ?? 0,
    clientes: await incluirNomeDosClientes(usuarioId, compras),
  };
}
