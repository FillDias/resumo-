import { Suspense } from "react";
import { connection } from "next/server";
import { ChevronLeft, ChevronRight, CircleDollarSign, HandCoins, Percent, Wallet } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Celula, Linha, Tabela } from "@/components/ui/tabela";
import { buscarFechamentoDoMes } from "@/lib/db/resumo";
import { formatarData, formatarMesAno, formatarMoeda, formatarPercentual } from "@/lib/format";
import { usuarioLogado } from "@/lib/auth/sessao";

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
    <>
      <h1 className="text-2xl font-semibold">Relatório financeiro</h1>
      <p className="mt-1 text-muted">Fechamento mensal de vendas e recebimentos</p>

      <Suspense fallback={<p className="mt-6 text-muted">Carregando relatório...</p>}>
        <FechamentoDoMes searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function FechamentoDoMes({ searchParams }: Pick<PageProps<"/relatorio">, "searchParams">) {
  await connection();
  const referencia = mesDaUrl((await searchParams).mes);
  const usuario = await usuarioLogado();
  const fechamento = await buscarFechamentoDoMes(usuario.id, referencia);

  return (
    <>
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-medium">{formatarMesAno(referencia)}</h2>
        <div className="flex gap-2">
          <LinkButton href={linkDoMes(referencia, -1)} variante="secundario">
            <ChevronLeft size={18} />
            Mês anterior
          </LinkButton>
          <LinkButton href={linkDoMes(referencia, 1)} variante="secundario">
            Próximo mês
            <ChevronRight size={18} />
          </LinkButton>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Total vendido"
          valor={formatarMoeda(fechamento.totalVendido)}
          detalhe={`À vista ${formatarMoeda(fechamento.vendidoAVista)} · Parcelado ${formatarMoeda(fechamento.vendidoParcelado)}`}
          icone={CircleDollarSign}
        />
        <MetricCard
          label="Total recebido"
          valor={formatarMoeda(fechamento.totalRecebido)}
          detalhe="Vendas à vista e parcelas pagas no mês"
          icone={HandCoins}
        />
        <MetricCard
          label="Em aberto no mês"
          valor={formatarMoeda(fechamento.valorEmAberto)}
          detalhe={`${fechamento.parcelasEmAberto} parcelas com vencimento no mês sem pagamento`}
          icone={Wallet}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Inadimplência"
          valor={formatarPercentual(fechamento.taxaDeInadimplencia)}
          detalhe={`${formatarMoeda(fechamento.valorInadimplente)} não pagos de ${formatarMoeda(fechamento.valorVencido)} vencidos no mês`}
          icone={Percent}
          tom="perigo"
        />

        <Card className="md:col-span-2">
          <h3 className="mb-4 text-lg font-medium">Clientes inadimplentes</h3>
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
                  <Celula className="font-medium">{inadimplente.nome}</Celula>
                  <Celula numerica>{inadimplente.parcelas}</Celula>
                  <Celula numerica className="text-danger">
                    {formatarData(inadimplente.vencimentoMaisAntigo)}
                  </Celula>
                  <Celula numerica className="font-semibold">
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
