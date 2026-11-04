import { Suspense } from "react";
import { connection } from "next/server";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { CabecalhoDaPagina } from "@/components/ui/cabecalho-da-pagina";
import { Card } from "@/components/ui/card";
import { Metricas } from "@/components/ui/metricas";
import { Celula, Linha, Tabela } from "@/components/ui/tabela";
import { usuarioLogado } from "@/lib/auth/sessao";
import { buscarFechamentoDoMes } from "@/lib/db/resumo";
import { formatarData, formatarMesAno, formatarMoeda, formatarPercentual } from "@/lib/format";
import { GraficoVendasPorTipo } from "./grafico-vendas-por-tipo";

function mesDaUrl(mes: string | string[] | undefined) {
  const [ano, numeroDoMes] = typeof mes === "string" && /^\d{4}-\d{2}$/.test(mes) ? mes.split("-").map(Number) : [];
  const hoje = new Date();
  return ano ? new Date(ano, numeroDoMes - 1, 1) : new Date(hoje.getFullYear(), hoje.getMonth(), 1);
}

function linkDoMes(referencia: Date, deslocamento: number) {
  const mes = new Date(referencia.getFullYear(), referencia.getMonth() + deslocamento, 1);
  return `/relatorio?mes=${mes.getFullYear()}-${String(mes.getMonth() + 1).padStart(2, "0")}`;
}

export default function RelatorioPage({ searchParams }: PageProps<"/relatorio">) {
  return (
    <Suspense fallback={<p className="text-muted">Carregando relatório...</p>}>
      <FechamentoDoMes searchParams={searchParams} />
    </Suspense>
  );
}

async function FechamentoDoMes({ searchParams }: Pick<PageProps<"/relatorio">, "searchParams">) {
  await connection();
  const referencia = mesDaUrl((await searchParams).mes);
  const usuario = await usuarioLogado();
  const fechamento = await buscarFechamentoDoMes(usuario.id, referencia);

  return (
    <>
      <CabecalhoDaPagina titulo="Relatório financeiro" descricao={`Fechamento de ${formatarMesAno(referencia).toLowerCase()}`}>
        <div className="grid grid-cols-2 gap-2">
          <LinkButton href={linkDoMes(referencia, -1)} variante="secundario">
            <ChevronLeft size={18} />
            Anterior
          </LinkButton>
          <LinkButton href={linkDoMes(referencia, 1)} variante="secundario">
            Próximo
            <ChevronRight size={18} />
          </LinkButton>
        </div>
      </CabecalhoDaPagina>

      <Metricas
        itens={[
          {
            label: "Total vendido",
            valor: formatarMoeda(fechamento.totalVendido),
            detalhe: "Vendas registradas no mês",
          },
          {
            label: "Total recebido",
            valor: formatarMoeda(fechamento.totalRecebido),
            detalhe: "Vendas à vista e parcelas pagas no mês",
          },
          {
            label: "Em aberto no mês",
            valor: formatarMoeda(fechamento.valorEmAberto),
            detalhe: `${fechamento.parcelasEmAberto} parcelas vencendo no mês sem pagamento`,
          },
          {
            label: "Inadimplência",
            valor: formatarPercentual(fechamento.taxaDeInadimplencia),
            detalhe: `${formatarMoeda(fechamento.valorInadimplente)} não pagos de ${formatarMoeda(fechamento.valorVencido)} vencidos`,
            destaqueDePerigo: true,
          },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="mb-5 text-base font-semibold">Vendas por tipo</h2>
          <GraficoVendasPorTipo aVista={fechamento.vendidoAVista} parcelado={fechamento.vendidoParcelado} />
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold">Clientes inadimplentes</h2>
          {fechamento.inadimplentes.length === 0 ? (
            <p className="py-6 text-center text-muted">Nenhuma parcela vencida sem pagamento neste mês.</p>
          ) : (
            <Tabela
              colunas={[
                { titulo: "Cliente" },
                { titulo: "Parcelas", numerica: true },
                { titulo: "Vencida desde", numerica: true },
                { titulo: "Valor devido", numerica: true },
              ]}
            >
              {fechamento.inadimplentes.map((inadimplente) => (
                <Linha key={inadimplente.clienteId}>
                  <Celula rotulo="Cliente" className="font-medium">
                    {inadimplente.nome}
                  </Celula>
                  <Celula rotulo="Parcelas" numerica>
                    {inadimplente.parcelas}
                  </Celula>
                  <Celula rotulo="Vencida desde" numerica className="text-danger">
                    {formatarData(inadimplente.vencimentoMaisAntigo)}
                  </Celula>
                  <Celula rotulo="Valor devido" numerica className="font-semibold">
                    {formatarMoeda(inadimplente.valor)}
                  </Celula>
                </Linha>
              ))}
            </Tabela>
          )}
        </Card>
      </div>
    </>
  );
}
