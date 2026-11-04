import { prisma } from "./prisma";

export async function listarClientesComTotais(usuarioId: number) {
  const clientes = await prisma.cliente.findMany({
    where: { usuarioId },
    orderBy: { nome: "asc" },
    include: { vendas: { select: { valorTotal: true } } },
  });

  return clientes.map(({ vendas, ...cliente }) => ({
    ...cliente,
    quantidadeDeVendas: vendas.length,
    totalComprado: vendas.reduce((total, venda) => total + venda.valorTotal, 0),
  }));
}

export async function listarNomesDeClientes(usuarioId: number) {
  return prisma.cliente.findMany({ where: { usuarioId }, orderBy: { nome: "asc" }, select: { id: true, nome: true } });
}

export async function excluirCliente(usuarioId: number, clienteId: number) {
  const cliente = await prisma.cliente.findFirstOrThrow({
    where: { id: clienteId, usuarioId },
    select: { _count: { select: { vendas: true } } },
  });
  if (cliente._count.vendas > 0) return { excluido: false };

  await prisma.cliente.delete({ where: { id: clienteId } });
  return { excluido: true };
}

export async function criarCliente(cliente: { usuarioId: number; nome: string; telefone: string; email: string | null }) {
  return prisma.cliente.create({ data: cliente });
}
