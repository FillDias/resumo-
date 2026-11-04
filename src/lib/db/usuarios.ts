import { prisma } from "./prisma";

export async function buscarUsuarioPorEmail(email: string) {
  return prisma.usuario.findUnique({ where: { email } });
}

export async function buscarUsuarioPorEmailOuCnpj(email: string, cnpj: string) {
  return prisma.usuario.findFirst({ where: { OR: [{ email }, { cnpj }] }, select: { email: true, cnpj: true } });
}

// Toda venda exige um vendedor e não há tela de vendedores, então a conta já nasce com o próprio dono como vendedor.
export async function criarUsuario(usuario: { email: string; senhaHash: string; cnpj: string }) {
  return prisma.usuario.create({
    data: { ...usuario, vendedores: { create: { nome: "Proprietário", email: usuario.email } } },
  });
}
