"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Campo } from "@/components/ui/campo";
import { cadastrarVendedor } from "./actions";

export function VendedorForm() {
  const [estado, acao, salvando] = useActionState(cadastrarVendedor, {});

  return (
    <form action={acao} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Campo
          label="Nome"
          name="nome"
          placeholder="Ex.: Juliana Souza"
          defaultValue={estado.valores?.nome}
          erro={estado.erros?.nome}
        />
        <Campo
          label="E-mail"
          name="email"
          type="email"
          placeholder="juliana@empresa.com.br"
          defaultValue={estado.valores?.email}
          erro={estado.erros?.email}
        />
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
        {estado.sucesso && <span className="text-center text-sm text-success">Vendedor cadastrado.</span>}
        <Button type="submit" disabled={salvando} className="w-full sm:w-auto">
          <UserPlus size={18} />
          {salvando ? "Salvando..." : "Cadastrar vendedor"}
        </Button>
      </div>
    </form>
  );
}
