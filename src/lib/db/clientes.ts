import { prisma } from "./prisma";

export async function listarClientesComTotais() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { nome: "asc" },
    include: { vendas: { select: { valorTotal: true } } },
  });

  return clientes.map(({ vendas, ...cliente }) => ({
    ...cliente,
    quantidadeDeVendas: vendas.length,
    totalComprado: vendas.reduce((total, venda) => total + venda.valorTotal, 0),
  }));
}

export async function criarCliente(cliente: { nome: string; telefone: string; email: string | null }) {
  return prisma.cliente.create({ data: cliente });
}
