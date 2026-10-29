import { Suspense } from "react";
import { connection } from "next/server";
import { CabecalhoDaPagina } from "@/components/ui/cabecalho-da-pagina";
import { Card } from "@/components/ui/card";
import { Celula, Linha, Tabela } from "@/components/ui/tabela";
import { usuarioLogado } from "@/lib/auth/sessao";
import { listarNomesDeClientes } from "@/lib/db/clientes";
import { listarVendas } from "@/lib/db/vendas";
import { listarVendedores } from "@/lib/db/vendedores";
import { formatarData, formatarDataParaInput, formatarMoeda } from "@/lib/format";
import { VendaForm } from "./venda-form";

export default function VendasPage() {
  return (
    <>
      <CabecalhoDaPagina titulo="Vendas" descricao="Registro de vendas à vista e parceladas" />

      <Suspense fallback={<p className="text-muted">Carregando vendas...</p>}>
        <ConteudoDeVendas />
      </Suspense>
    </>
  );
}

async function ConteudoDeVendas() {
  await connection();
  const usuario = await usuarioLogado();
  const [clientes, vendedores, vendas] = await Promise.all([
    listarNomesDeClientes(usuario.id),
    listarVendedores(usuario.id),
    listarVendas(usuario.id),
  ]);

  return (
    <>
      <Card>
        <h2 className="mb-4 text-base font-semibold">Nova venda</h2>
        <VendaForm clientes={clientes} vendedores={vendedores} hoje={formatarDataParaInput(new Date())} />
      </Card>

      <Card className="mt-6">
        <h2 className="mb-4 text-base font-semibold">
          Vendas registradas <span className="font-normal text-muted">({vendas.length})</span>
        </h2>
        {vendas.length === 0 ? (
          <p className="py-6 text-center text-muted">Nenhuma venda registrada ainda.</p>
        ) : (
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
                <Celula rotulo="Data" className="tabular-nums">
                  {formatarData(venda.dataVenda)}
                </Celula>
                <Celula rotulo="Cliente" className="font-medium">
                  {venda.cliente.nome}
                </Celula>
                <Celula rotulo="Vendedor">{venda.vendedor.nome}</Celula>
                <Celula rotulo="Tipo">{venda.tipo === "AVISTA" ? "À vista" : "Parcelada"}</Celula>
                <Celula rotulo="Parcelas" numerica className={venda.numeroParcelas ? "" : "text-muted"}>
                  {venda.numeroParcelas ? `${venda.numeroParcelas}x` : "—"}
                </Celula>
                <Celula rotulo="Valor" numerica className="font-semibold">
                  {formatarMoeda(venda.valorTotal)}
                </Celula>
              </Linha>
            ))}
          </Tabela>
        )}
      </Card>
    </>
  );
}
