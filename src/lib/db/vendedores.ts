import { prisma } from "./prisma";

export async function listarVendedores(usuarioId: number) {
  return prisma.vendedor.findMany({ where: { usuarioId }, orderBy: { nome: "asc" }, select: { id: true, nome: true } });
}
