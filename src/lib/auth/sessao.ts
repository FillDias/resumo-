import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "../db/prisma";
import { NOME_DO_COOKIE_DE_SESSAO } from "./cookie";

const DURACAO_DA_SESSAO_EM_MS = 7 * 24 * 60 * 60 * 1000;

function hashDoToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function criarSessao(usuarioId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(Date.now() + DURACAO_DA_SESSAO_EM_MS);
  await prisma.sessao.create({ data: { id: hashDoToken(token), usuarioId, expiraEm } });

  (await cookies()).set(NOME_DO_COOKIE_DE_SESSAO, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiraEm,
  });
}

export async function encerrarSessao() {
  const cookieStore = await cookies();
  const token = cookieStore.get(NOME_DO_COOKIE_DE_SESSAO)?.value;
  if (token) await prisma.sessao.deleteMany({ where: { id: hashDoToken(token) } });
  cookieStore.delete(NOME_DO_COOKIE_DE_SESSAO);
}

export const usuarioLogado = cache(async () => {
  const token = (await cookies()).get(NOME_DO_COOKIE_DE_SESSAO)?.value;
  const sessao = token
    ? await prisma.sessao.findUnique({
        where: { id: hashDoToken(token) },
        include: { usuario: { select: { id: true, email: true, cnpj: true } } },
      })
    : null;

  if (!sessao || sessao.expiraEm < new Date()) redirect("/login");
  return sessao.usuario;
});
