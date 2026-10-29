"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Campo } from "@/components/ui/campo";
import { cadastrarCliente } from "./actions";

export function ClienteForm() {
  const [estado, acao, salvando] = useActionState(cadastrarCliente, {});

  return (
    <form action={acao} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Campo
          label="Nome"
          name="nome"
          placeholder="Ex.: Studio Bella Hair"
          defaultValue={estado.valores?.nome}
          erro={estado.erros?.nome}
        />
        <Campo
          label="Telefone"
          name="telefone"
          placeholder="(27) 99999-9999"
          defaultValue={estado.valores?.telefone}
          erro={estado.erros?.telefone}
        />
        <Campo
          label="E-mail (opcional)"
          name="email"
          type="email"
          placeholder="contato@salao.com.br"
          defaultValue={estado.valores?.email}
          erro={estado.erros?.email}
        />
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
        {estado.sucesso && <span className="text-center text-sm text-success">Cliente cadastrado.</span>}
        <Button type="submit" disabled={salvando} className="w-full sm:w-auto">
          <UserPlus size={18} />
          {salvando ? "Salvando..." : "Cadastrar cliente"}
        </Button>
      </div>
    </form>
  );
}
