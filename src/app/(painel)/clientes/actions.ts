"use server";

import { refresh } from "next/cache";
import { criarCliente } from "@/lib/db/clientes";
import { usuarioLogado } from "@/lib/auth/sessao";

type CamposCliente = { nome: string; telefone: string; email: string };

export type EstadoCadastroCliente = {
  erros?: Partial<Record<keyof CamposCliente, string>>;
  valores?: CamposCliente;
  sucesso?: boolean;
};

export async function cadastrarCliente(
  _estadoAnterior: EstadoCadastroCliente,
  formData: FormData,
): Promise<EstadoCadastroCliente> {
  const valores = {
    nome: String(formData.get("nome")).trim(),
    telefone: String(formData.get("telefone")).trim(),
    email: String(formData.get("email")).trim(),
  };

  const erros: EstadoCadastroCliente["erros"] = {};
  if (valores.nome.length < 3) erros.nome = "Informe o nome do cliente.";
  const digitosTelefone = valores.telefone.replace(/\D/g, "").length;
  if (digitosTelefone < 10 || digitosTelefone > 11) erros.telefone = "Informe o telefone com DDD.";
  if (valores.email && !/^\S+@\S+\.\S+$/.test(valores.email)) erros.email = "E-mail inválido.";

  if (Object.keys(erros).length > 0) return { erros, valores };

  const usuario = await usuarioLogado();
  await criarCliente({ ...valores, email: valores.email || null, usuarioId: usuario.id });
  refresh();
  return { sucesso: true };
}
