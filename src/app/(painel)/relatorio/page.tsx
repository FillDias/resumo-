import { Suspense } from "react";
import { connection } from "next/server";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TipoVenda } from "@prisma/client";
import { Button, LinkButton } from "@/components/ui/button";
import { CabecalhoDaPagina } from "@/components/ui/cabecalho-da-pagina";
import { Card } from "@/components/ui/card";
import { CampoSelect } from "@/components/ui/campo";
import { Metricas } from "@/components/ui/metricas";
import { Celula, Linha, Tabela } from "@/components/ui/tabela";
import { usuarioLogado } from "@/lib/auth/sessao";
import { buscarFechamentoDoMes, listarComprasPorClienteNoMes, listarMaioresClientesDoAno } from "@/lib/db/resumo";
import { formatarData, formatarDataParaInput, formatarMesAno, formatarMoeda, formatarPercentual } from "@/lib/format";
import { ordensDeValor, type OrdemDeValor } from "@/lib/types";
import { GraficoVendasPorTipo } from "./grafico-vendas-por-tipo";

const opcoesDeTipo: { id: TipoVenda; nome: string }[] = [
  { id: "AVISTA", nome: "À vista" },
  { id: "PARCELADA", nome: "Parcelada" },
];

const opcoesDeOrdem: { id: OrdemDeValor; nome: string }[] = [
  { id: "maior", nome: "Maior valor primeiro" },
  { id: "menor", nome: "Menor valor primeiro" },
];

type FiltrosDeCompras = { tipo?: TipoVenda; ordem: OrdemDeValor };

function mesDaUrl(mes: string | string[] | undefined) {
  const [ano, numeroDoMes] = typeof mes === "string" && /^\d{4}-\d{2}$/.test(mes) ? mes.split("-").map(Number) : [];
  const hoje = new Date();
  return ano ? new Date(ano, numeroDoMes - 1, 1) : new Date(hoje.getFullYear(), hoje.getMonth(), 1);
}

function parametroDoMes(mes: Date) {
  return formatarDataParaInput(mes).slice(0, 7);
}

function linkDoMes(referencia: Date, deslocamento: number, filtros: FiltrosDeCompras) {
  const mes = new Date(referencia.getFullYear(), referencia.getMonth() + deslocamento, 1);
  const parametros = new URLSearchParams({ mes: parametroDoMes(mes), ordem: filtros.ordem });
  if (filtros.tipo) parametros.set("tipo", filtros.tipo);
  return `/relatorio?${parametros}`;
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
  const { mes, tipo, ordem } = await searchParams;
  const referencia = mesDaUrl(mes);
  const filtros: FiltrosDeCompras = {
    tipo: opcoesDeTipo.find((opcao) => opcao.id === tipo)?.id,
    ordem: ordensDeValor.find((opcao) => opcao === ordem) ?? "maior",
  };

  const usuario = await usuarioLogado();
  const [fechamento, comprasPorCliente, maioresDoAno] = await Promise.all([
    buscarFechamentoDoMes(usuario.id, referencia),
    listarComprasPorClienteNoMes(usuario.id, referencia, filtros),
    listarMaioresClientesDoAno(usuario.id, referencia.getFullYear()),
  ]);
  const totalCompradoNoMes = comprasPorCliente.reduce((total, compra) => total + compra.valorComprado, 0);

  return (
    <>
      <CabecalhoDaPagina titulo="Relatório financeiro" descricao={`Fechamento de ${formatarMesAno(referencia).toLowerCase()}`}>
        <div className="grid grid-cols-2 gap-2">
          <LinkButton href={linkDoMes(referencia, -1, filtros)} variante="secundario">
            <ChevronLeft size={18} />
            Anterior
          </LinkButton>
          <LinkButton href={linkDoMes(referencia, 1, filtros)} variante="secundario">
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

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold">Compras por cliente no mês</h2>
          <form action="/relatorio" className="mb-5 flex flex-col gap-4 md:flex-row md:items-end">
            <input type="hidden" name="mes" value={parametroDoMes(referencia)} />
            <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
              <CampoSelect
                label="Tipo de venda"
                name="tipo"
                placeholder="Todos os tipos"
                opcoes={opcoesDeTipo}
                defaultValue={filtros.tipo ?? ""}
              />
              <CampoSelect label="Ordenar por" name="ordem" opcoes={opcoesDeOrdem} defaultValue={filtros.ordem} />
            </div>
            <Button type="submit" variante="secundario" className="w-full md:w-auto">
              Filtrar
            </Button>
          </form>

          {comprasPorCliente.length === 0 ? (
            <p className="py-6 text-center text-muted">Nenhuma compra encontrada neste mês com esses filtros.</p>
          ) : (
            <Tabela
              colunas={[
                { titulo: "Cliente" },
                { titulo: "Compras", numerica: true },
                { titulo: "Participação", numerica: true },
                { titulo: "Valor comprado", numerica: true },
              ]}
            >
              {comprasPorCliente.map((compra) => (
                <Linha key={compra.clienteId}>
                  <Celula rotulo="Cliente" className="font-medium">
                    {compra.nome}
                  </Celula>
                  <Celula rotulo="Compras" numerica>
                    {compra.quantidadeDeCompras}
                  </Celula>
                  <Celula rotulo="Participação" numerica className="text-muted">
                    {formatarPercentual(compra.valorComprado / totalCompradoNoMes)}
                  </Celula>
                  <Celula rotulo="Valor comprado" numerica className="font-semibold">
                    {formatarMoeda(compra.valorComprado)}
                  </Celula>
                </Linha>
              ))}
            </Tabela>
          )}
        </Card>

        <Card>
          <h2 className="mb-1 text-base font-semibold">Maiores clientes de {referencia.getFullYear()}</h2>
          <p className="mb-5 text-muted">Total comprado no ano até o momento</p>
          {maioresDoAno.clientes.length === 0 ? (
            <p className="py-6 text-center text-muted">Nenhuma venda registrada neste ano.</p>
          ) : (
            <ol className="flex flex-col gap-4">
              {maioresDoAno.clientes.map((cliente, indice) => (
                <li key={cliente.clienteId} className="flex items-center gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-bg text-xs font-semibold tabular-nums">
                    {indice + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{cliente.nome}</span>
                    <span className="block text-xs text-muted">
                      {cliente.quantidadeDeCompras} {cliente.quantidadeDeCompras === 1 ? "compra" : "compras"}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-semibold tabular-nums">{formatarMoeda(cliente.valorComprado)}</span>
                    <span className="block text-xs text-muted tabular-nums">
                      {formatarPercentual(cliente.valorComprado / maioresDoAno.totalVendidoNoAno)} do ano
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </>
  );
}
