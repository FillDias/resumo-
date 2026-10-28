import { Suspense } from "react";
import { connection } from "next/server";
import { Card } from "@/components/ui/card";
import { Celula, Linha, Tabela } from "@/components/ui/tabela";
import { listarNomesDeClientes } from "@/lib/db/clientes";
import { listarVendas } from "@/lib/db/vendas";
import { listarVendedores } from "@/lib/db/vendedores";
import { formatarData, formatarDataParaInput, formatarMoeda } from "@/lib/format";
import { VendaForm } from "./venda-form";

export default function VendasPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Vendas</h1>
      <p className="mt-1 text-muted">Registro de vendas à vista e parceladas</p>

      <Suspense fallback={<p className="mt-6 text-muted">Carregando vendas...</p>}>
        <ConteudoDeVendas />
      </Suspense>
    </>
  );
}

async function ConteudoDeVendas() {
  await connection();
  const [clientes, vendedores, vendas] = await Promise.all([
    listarNomesDeClientes(),
    listarVendedores(),
    listarVendas(),
  ]);

  return (
    <>
      <Card className="mt-6">
        <h2 className="mb-4 text-lg font-medium">Nova venda</h2>
        <VendaForm clientes={clientes} vendedores={vendedores} hoje={formatarDataParaInput(new Date())} />
      </Card>

      <Card className="mt-4">
        <h2 className="mb-4 text-lg font-medium">Vendas registradas ({vendas.length})</h2>
        <Tabela
          colunas={[
            { titulo: "Data" },
            { titulo: "Cliente" },
            { titulo: "Vendedor" },
            { titulo: "Tipo" },
            { titulo: "Parcelas", numerica: true },
            { titulo: "Valor", numerica: true },
          ]}
        >
          {vendas.map((venda) => (
            <Linha key={venda.id}>
              <Celula className="tabular-nums">{formatarData(venda.dataVenda)}</Celula>
              <Celula className="font-medium">{venda.cliente.nome}</Celula>
              <Celula>{venda.vendedor.nome}</Celula>
              <Celula>{venda.tipo === "AVISTA" ? "À vista" : "Parcelada"}</Celula>
              <Celula numerica className={venda.numeroParcelas ? "" : "text-muted"}>
                {venda.numeroParcelas ? `${venda.numeroParcelas}x` : "—"}
              </Celula>
              <Celula numerica className="font-semibold">
                {formatarMoeda(venda.valorTotal)}
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Card>
    </>
  );
}
