import { Suspense } from "react";
import { connection } from "next/server";
import { CabecalhoDaPagina } from "@/components/ui/cabecalho-da-pagina";
import { Card } from "@/components/ui/card";
import { Celula, Linha, Tabela } from "@/components/ui/tabela";
import { usuarioLogado } from "@/lib/auth/sessao";
import { listarClientesComTotais } from "@/lib/db/clientes";
import { formatarData, formatarMoeda } from "@/lib/format";
import { BotaoExcluirCliente } from "./botao-excluir-cliente";
import { ClienteForm } from "./cliente-form";

export default function ClientesPage() {
  return (
    <>
      <CabecalhoDaPagina titulo="Clientes" descricao="Salões e profissionais atendidos pela distribuidora" />

      <Card>
        <h2 className="mb-4 text-base font-semibold">Novo cliente</h2>
        <ClienteForm />
      </Card>

      <Suspense fallback={<p className="mt-6 text-muted">Carregando clientes...</p>}>
        <ListaDeClientes />
      </Suspense>
    </>
  );
}

async function ListaDeClientes() {
  await connection();
  const usuario = await usuarioLogado();
  const clientes = await listarClientesComTotais(usuario.id);

  return (
    <Card className="mt-6">
      <h2 className="mb-4 text-base font-semibold">
        Clientes cadastrados <span className="font-normal text-muted">({clientes.length})</span>
      </h2>
      {clientes.length === 0 ? (
        <p className="py-6 text-center text-muted">Nenhum cliente cadastrado ainda.</p>
      ) : (
        <Tabela
          colunas={[
            { titulo: "Cliente" },
            { titulo: "Telefone" },
            { titulo: "E-mail" },
            { titulo: "Vendas", numerica: true },
            { titulo: "Total comprado", numerica: true },
            { titulo: "Cadastrado em", numerica: true },
            { titulo: "Ações", numerica: true },
          ]}
        >
          {clientes.map((cliente) => (
            <Linha key={cliente.id}>
              <Celula rotulo="Cliente" className="font-medium">
                {cliente.nome}
              </Celula>
              <Celula rotulo="Telefone">{cliente.telefone}</Celula>
              <Celula rotulo="E-mail" className={`break-all ${cliente.email ? "" : "text-muted"}`}>
                {cliente.email ?? "—"}
              </Celula>
              <Celula rotulo="Vendas" numerica>
                {cliente.quantidadeDeVendas}
              </Celula>
              <Celula rotulo="Total comprado" numerica className="font-semibold">
                {formatarMoeda(cliente.totalComprado)}
              </Celula>
              <Celula rotulo="Cadastrado em" numerica>
                {formatarData(cliente.createdAt)}
              </Celula>
              <Celula rotulo="Ações" numerica className="md:py-1">
                <BotaoExcluirCliente
                  clienteId={cliente.id}
                  nome={cliente.nome}
                  temVendas={cliente.quantidadeDeVendas > 0}
                />
              </Celula>
            </Linha>
          ))}
        </Tabela>
      )}
    </Card>
  );
}
