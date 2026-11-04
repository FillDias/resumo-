"use server";

import { refresh } from "next/cache";
import { registrarPagamentoDaParcela } from "@/lib/db/parcelas";
import { usuarioLogado } from "@/lib/auth/sessao";

export async function marcarParcelaComoPaga(parcelaId: number) {
  const usuario = await usuarioLogado();
  await registrarPagamentoDaParcela(usuario.id, parcelaId, new Date());
  refresh();
}
