"use server";

import { refresh } from "next/cache";
import { criarVenda } from "@/lib/db/vendas";
import { formatarDataParaInput } from "@/lib/format";

const MAXIMO_DE_PARCELAS = 12;

type CamposVenda = {
  clienteId: string;
  vendedorId: string;
  tipo: string;
  valorTotal: string;
  numeroParcelas: string;
  dataVenda: string;
};

export type EstadoRegistroVenda = {
  erros?: Partial<Record<keyof CamposVenda, string>>;
  valores?: CamposVenda;
  mensagemSucesso?: string;
};

export async function registrarVenda(
  _estadoAnterior: EstadoRegistroVenda,
  formData: FormData,
): Promise<EstadoRegistroVenda> {
  const valores: CamposVenda = {
    clienteId: String(formData.get("clienteId")),
    vendedorId: String(formData.get("vendedorId")),
    tipo: String(formData.get("tipo")),
    valorTotal: String(formData.get("valorTotal")),
    numeroParcelas: String(formData.get("numeroParcelas") ?? ""),
    dataVenda: String(formData.get("dataVenda")),
  };
  const parcelada = valores.tipo === "PARCELADA";
  const valorTotal = Number(valores.valorTotal);
  const numeroParcelas = Number(valores.numeroParcelas);

  const erros: EstadoRegistroVenda["erros"] = {};
  if (!valores.clienteId) erros.clienteId = "Selecione o cliente.";
  if (!valores.vendedorId) erros.vendedorId = "Selecione o vendedor.";
  if (!(valorTotal > 0)) erros.valorTotal = "Informe o valor da venda.";
  if (parcelada && !(Number.isInteger(numeroParcelas) && numeroParcelas >= 2 && numeroParcelas <= MAXIMO_DE_PARCELAS)) {
    erros.numeroParcelas = `Informe de 2 a ${MAXIMO_DE_PARCELAS} parcelas.`;
  }
  if (!valores.dataVenda) erros.dataVenda = "Informe a data da venda.";
  else if (valores.dataVenda > formatarDataParaInput(new Date())) erros.dataVenda = "A data não pode ser futura.";

  if (Object.keys(erros).length > 0) return { erros, valores };

  await criarVenda({
    clienteId: Number(valores.clienteId),
    vendedorId: Number(valores.vendedorId),
    tipo: parcelada ? "PARCELADA" : "AVISTA",
    valorTotal,
    numeroParcelas: parcelada ? numeroParcelas : undefined,
    dataVenda: new Date(`${valores.dataVenda}T12:00:00`),
  });
  refresh();
  return {
    mensagemSucesso: parcelada
      ? `Venda registrada com ${numeroParcelas} parcelas semanais.`
      : "Venda à vista registrada e quitada.",
  };
}
