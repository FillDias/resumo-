import { prisma } from "./prisma";
import type { NovaVenda } from "../types";

const DIAS_ENTRE_PARCELAS = 7;

function gerarParcelas(valorTotal: number, numeroParcelas: number, dataVenda: Date) {
  const totalEmCentavos = Math.round(valorTotal * 100);
  const valorBaseEmCentavos = Math.floor(totalEmCentavos / numeroParcelas);
  // Os centavos que sobram da divisão ficam na última parcela, para a soma bater com o total.
  const sobraEmCentavos = totalEmCentavos - valorBaseEmCentavos * numeroParcelas;

  return Array.from({ length: numeroParcelas }, (_, indice) => {
    const numero = indice + 1;
    const dataVencimento = new Date(dataVenda);
    dataVencimento.setDate(dataVencimento.getDate() + numero * DIAS_ENTRE_PARCELAS);
    const valorEmCentavos = valorBaseEmCentavos + (numero === numeroParcelas ? sobraEmCentavos : 0);
    return { numero, valor: valorEmCentavos / 100, dataVencimento };
  });
}

export async function criarVenda(usuarioId: number, { numeroParcelas, ...venda }: NovaVenda) {
  await Promise.all([
    prisma.cliente.findFirstOrThrow({ where: { id: venda.clienteId, usuarioId } }),
    prisma.vendedor.findFirstOrThrow({ where: { id: venda.vendedorId, usuarioId } }),
  ]);

  if (venda.tipo === "AVISTA") {
    return prisma.venda.create({
      data: {
        ...venda,
        pagamentos: { create: { valorPago: venda.valorTotal, dataPagamento: venda.dataVenda } },
      },
    });
  }

  return prisma.venda.create({
    data: {
      ...venda,
      numeroParcelas,
      parcelas: { create: gerarParcelas(venda.valorTotal, numeroParcelas!, venda.dataVenda) },
    },
  });
}

export async function listarVendas(usuarioId: number) {
  return prisma.venda.findMany({
    where: { cliente: { usuarioId } },
    orderBy: [{ dataVenda: "desc" }, { id: "desc" }],
    include: { cliente: { select: { nome: true } }, vendedor: { select: { nome: true } } },
  });
}
