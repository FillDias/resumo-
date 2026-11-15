import { prisma } from "./prisma";

export async function listarVendedores(usuarioId: number) {
  return prisma.vendedor.findMany({ where: { usuarioId }, orderBy: { nome: "asc" }, select: { id: true, nome: true } });
}

export async function criarVendedor(vendedor: { usuarioId: number; nome: string; email: string }) {
  return prisma.vendedor.create({ data: vendedor });
}
