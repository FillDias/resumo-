import { Suspense } from "react";
import { connection } from "next/server";
import { Card } from "@/components/ui/card";
import { Celula, Linha, Tabela } from "@/components/ui/tabela";
import { listarClientesComTotais } from "@/lib/db/clientes";
import { formatarData, formatarMoeda } from "@/lib/format";
import { ClienteForm } from "./cliente-form";
import { usuarioLogado } from "@/lib/auth/sessao";

export default function ClientesPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Clientes</h1>
      <p className="mt-1 text-muted">Salões e profissionais atendidos pela distribuidora</p>

      <Card className="mt-6">
        <h2 className="mb-4 text-lg font-medium">Novo cliente</h2>
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
    <Card className="mt-4">
      <h2 className="mb-4 text-lg font-medium">Clientes cadastrados ({clientes.length})</h2>
      <Tabela
        colunas={[
          { titulo: "Cliente" },
          { titulo: "Telefone" },
          { titulo: "E-mail" },
          { titulo: "Vendas", numerica: true },
          { titulo: "Total comprado", numerica: true },
          { titulo: "Cadastrado em", numerica: true },
        ]}
      >
        {clientes.map((cliente) => (
          <Linha key={cliente.id}>
            <Celula className="font-medium">{cliente.nome}</Celula>
            <Celula>{cliente.telefone}</Celula>
            <Celula className={cliente.email ? "" : "text-muted"}>{cliente.email ?? "—"}</Celula>
            <Celula numerica>{cliente.quantidadeDeVendas}</Celula>
            <Celula numerica className="font-semibold">
              {formatarMoeda(cliente.totalComprado)}
            </Celula>
            <Celula numerica>{formatarData(cliente.createdAt)}</Celula>
          </Linha>
        ))}
      </Tabela>
    </Card>
  );
}
