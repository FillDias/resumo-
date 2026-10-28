import { prisma } from "./prisma";

export async function listarVendedores() {
  return prisma.vendedor.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } });
}
