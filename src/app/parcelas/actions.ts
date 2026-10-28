"use server";

import { refresh } from "next/cache";
import { registrarPagamentoDaParcela } from "@/lib/db/parcelas";

export async function marcarParcelaComoPaga(parcelaId: number) {
  await registrarPagamentoDaParcela(parcelaId, new Date());
  refresh();
}
