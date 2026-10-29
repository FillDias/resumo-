"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Campo } from "@/components/ui/campo";
import { cadastrar, entrar } from "./actions";

const modos = {
  login: {
    acao: entrar,
    botao: "Entrar",
    enviando: "Entrando...",
    rodape: { texto: "Ainda não tem conta?", link: "/cadastro", rotuloDoLink: "Criar cadastro" },
  },
  cadastro: {
    acao: cadastrar,
    botao: "Criar conta",
    enviando: "Criando conta...",
    rodape: { texto: "Já tem conta?", link: "/login", rotuloDoLink: "Entrar" },
  },
};

export function FormularioDeAcesso({ modo }: { modo: keyof typeof modos }) {
  const { acao, botao, enviando, rodape } = modos[modo];
  const [estado, acaoDoFormulario, salvando] = useActionState(acao, {});

  return (
    <form action={acaoDoFormulario} className="flex flex-col gap-4">
      {estado.erros?.geral && (
        <p className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{estado.erros.geral}</p>
      )}
      <Campo
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@empresa.com.br"
        defaultValue={estado.valores?.email}
        erro={estado.erros?.email}
        required
      />
      {modo === "cadastro" && (
        <Campo
          label="CNPJ"
          name="cnpj"
          placeholder="00.000.000/0000-00"
          defaultValue={estado.valores?.cnpj}
          erro={estado.erros?.cnpj}
          required
        />
      )}
      <Campo
        label="Senha"
        name="senha"
        type="password"
        autoComplete={modo === "login" ? "current-password" : "new-password"}
        placeholder={modo === "cadastro" ? "Mínimo de 8 caracteres" : undefined}
        erro={estado.erros?.senha}
        required
      />
      <Button type="submit" disabled={salvando} className="mt-2 justify-center">
        {salvando ? enviando : botao}
      </Button>
      <p className="text-center text-muted">
        {rodape.texto}{" "}
        <Link href={rodape.link} className="font-medium text-brand hover:underline">
          {rodape.rotuloDoLink}
        </Link>
      </p>
    </form>
  );
}
