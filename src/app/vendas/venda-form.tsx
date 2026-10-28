"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Campo, CampoSelect } from "@/components/ui/campo";
import { registrarVenda } from "./actions";

type Opcao = { id: number; nome: string };

const tiposDeVenda = [
  { valor: "AVISTA", label: "À vista" },
  { valor: "PARCELADA", label: "Parcelada" },
];

export function VendaForm({ clientes, vendedores, hoje }: { clientes: Opcao[]; vendedores: Opcao[]; hoje: string }) {
  const [estado, acao, salvando] = useActionState(registrarVenda, {});
  const [tipo, setTipo] = useState("AVISTA");

  return (
    <form action={acao} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <CampoSelect
          label="Cliente"
          name="clienteId"
          placeholder="Selecione o cliente"
          opcoes={clientes}
          defaultValue={estado.valores?.clienteId}
          erro={estado.erros?.clienteId}
        />
        <CampoSelect
          label="Vendedor"
          name="vendedorId"
          placeholder="Selecione o vendedor"
          opcoes={vendedores}
          defaultValue={estado.valores?.vendedorId}
          erro={estado.erros?.vendedorId}
        />
        <Campo
          label="Data da venda"
          name="dataVenda"
          type="date"
          max={hoje}
          defaultValue={estado.valores?.dataVenda ?? hoje}
          erro={estado.erros?.dataVenda}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Tipo de venda</span>
          {/* Campo oculto em vez de radio: o reset automático do formulário desmarcaria o radio sem atualizar o estado. */}
          <input type="hidden" name="tipo" value={tipo} />
          <div role="radiogroup" aria-label="Tipo de venda" className="grid grid-cols-2 gap-2">
            {tiposDeVenda.map((opcao) => (
              <button
                key={opcao.valor}
                type="button"
                role="radio"
                aria-checked={tipo === opcao.valor}
                onClick={() => setTipo(opcao.valor)}
                className={`rounded-lg border px-3 py-2 font-medium ${
                  tipo === opcao.valor ? "border-brand bg-brand-light text-brand" : "border-border text-muted hover:bg-bg"
                }`}
              >
                {opcao.label}
              </button>
            ))}
          </div>
        </div>
        <Campo
          label="Valor total (R$)"
          name="valorTotal"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0,00"
          defaultValue={estado.valores?.valorTotal}
          erro={estado.erros?.valorTotal}
        />
        {tipo === "PARCELADA" && (
          <Campo
            label="Número de parcelas (semanais)"
            name="numeroParcelas"
            type="number"
            min="2"
            max="12"
            placeholder="Ex.: 4"
            defaultValue={estado.valores?.numeroParcelas}
            erro={estado.erros?.numeroParcelas}
          />
        )}
      </div>

      <div className="flex items-center justify-end gap-4">
        {estado.mensagemSucesso && <span className="text-sm text-success">{estado.mensagemSucesso}</span>}
        <Button type="submit" disabled={salvando}>
          <Plus size={18} />
          {salvando ? "Salvando..." : "Registrar venda"}
        </Button>
      </div>
    </form>
  );
}
