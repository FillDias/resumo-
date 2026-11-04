"use server";

import { redirect } from "next/navigation";
import { gerarHashDaSenha, senhaConfere } from "@/lib/auth/senha";
import { criarSessao, encerrarSessao } from "@/lib/auth/sessao";
import { cnpjValido, normalizarCnpj } from "@/lib/cnpj";
import { buscarUsuarioPorEmail, buscarUsuarioPorEmailOuCnpj, criarUsuario } from "@/lib/db/usuarios";

const TAMANHO_MINIMO_DA_SENHA = 8;

export type EstadoFormularioDeAcesso = {
  erros?: Partial<Record<"email" | "senha" | "cnpj" | "geral", string>>;
  valores?: { email: string; cnpj?: string };
};

function lerEmail(formData: FormData) {
  return String(formData.get("email")).trim().toLowerCase();
}

export async function entrar(
  _estadoAnterior: EstadoFormularioDeAcesso,
  formData: FormData,
): Promise<EstadoFormularioDeAcesso> {
  const email = lerEmail(formData);
  const senha = String(formData.get("senha"));

  const usuario = await buscarUsuarioPorEmail(email);
  if (!usuario || !(await senhaConfere(senha, usuario.senhaHash))) {
    return { erros: { geral: "E-mail ou senha incorretos." }, valores: { email } };
  }

  await criarSessao(usuario.id);
  redirect("/");
}

export async function cadastrar(
  _estadoAnterior: EstadoFormularioDeAcesso,
  formData: FormData,
): Promise<EstadoFormularioDeAcesso> {
  const email = lerEmail(formData);
  const cnpjDigitado = String(formData.get("cnpj")).trim();
  const cnpj = normalizarCnpj(cnpjDigitado);
  const senha = String(formData.get("senha"));
  const valores = { email, cnpj: cnpjDigitado };

  const erros: EstadoFormularioDeAcesso["erros"] = {};
  if (!/^\S+@\S+\.\S+$/.test(email)) erros.email = "Informe um e-mail válido.";
  if (!cnpjValido(cnpj)) erros.cnpj = "CNPJ inválido. Confira os números digitados.";
  if (senha.length < TAMANHO_MINIMO_DA_SENHA) erros.senha = `A senha precisa ter pelo menos ${TAMANHO_MINIMO_DA_SENHA} caracteres.`;
  if (Object.keys(erros).length > 0) return { erros, valores };

  const cadastroExistente = await buscarUsuarioPorEmailOuCnpj(email, cnpj);
  if (cadastroExistente?.email === email) return { erros: { email: "Este e-mail já está cadastrado." }, valores };
  if (cadastroExistente) return { erros: { cnpj: "Este CNPJ já está cadastrado." }, valores };

  const usuario = await criarUsuario({ email, cnpj, senhaHash: await gerarHashDaSenha(senha) });
  await criarSessao(usuario.id);
  redirect("/");
}

export async function sair() {
  await encerrarSessao();
  redirect("/login");
}
