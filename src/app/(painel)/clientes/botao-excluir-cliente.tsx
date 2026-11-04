"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { removerCliente } from "./actions";

export function BotaoExcluirCliente({ clienteId, nome, temVendas }: { clienteId: number; nome: string; temVendas: boolean }) {
  const [excluindo, iniciarExclusao] = useTransition();
  const motivo = temVendas ? "Clientes com vendas registradas não podem ser excluídos" : `Excluir ${nome}`;

  function confirmarExclusao() {
    if (!window.confirm(`Excluir o cliente "${nome}"? Essa ação não pode ser desfeita.`)) return;
    iniciarExclusao(async () => {
      const { erro } = await removerCliente(clienteId);
      if (erro) window.alert(erro);
    });
  }

  return (
    <button
      type="button"
      onClick={confirmarExclusao}
      disabled={temVendas || excluindo}
      title={motivo}
      aria-label={motivo}
      className="rounded-lg p-2 text-muted hover:bg-red-100 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted"
    >
      <Trash2 size={18} />
    </button>
  );
}
