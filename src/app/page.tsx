import { Suspense } from "react";
import { connection } from "next/server";
import {
  CalendarClock,
  CircleDollarSign,
  FileChartColumn,
  HandCoins,
  Plus,
  TriangleAlert,
  UserPlus,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { MetricCard } from "@/components/ui/metric-card";
import { buscarResumoDoMes } from "@/lib/db/resumo";
import { formatarMesAno, formatarMoeda } from "@/lib/format";

export default function DashboardPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <Suspense fallback={<p className="mt-6 text-muted">Carregando resumo...</p>}>
        <ResumoDoMes />
      </Suspense>
    </>
  );
}

async function ResumoDoMes() {
  await connection();
  const hoje = new Date();
  const resumo = await buscarResumoDoMes(hoje);

  return (
    <>
      <p className="mt-1 text-muted">Resumo financeiro de {formatarMesAno(hoje).toLowerCase()}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Total vendido no mês"
          valor={formatarMoeda(resumo.totalVendido)}
          detalhe={`À vista ${formatarMoeda(resumo.vendidoAVista)} · Parcelado ${formatarMoeda(resumo.vendidoParcelado)}`}
          icone={CircleDollarSign}
        />
        <MetricCard
          label="Total recebido no mês"
          valor={formatarMoeda(resumo.totalRecebido)}
          detalhe="Vendas à vista e parcelas pagas"
          icone={HandCoins}
        />
        <MetricCard
          label="Valor em aberto"
          valor={formatarMoeda(resumo.valorEmAberto)}
          detalhe={`${resumo.parcelasEmAberto} parcelas a receber`}
          icone={Wallet}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-muted">Parcelas em atraso</span>
            <span className="rounded-lg bg-red-100 p-2 text-danger">
              <TriangleAlert size={20} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-danger">{resumo.parcelasEmAtraso}</p>
          <p className="mt-1 text-xs text-muted">
            {formatarMoeda(resumo.valorEmAtraso)} vencidos e não pagos
          </p>
        </Card>

        <Card className="md:col-span-2">
          <h2 className="text-lg font-medium">Atalhos</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <LinkButton href="/vendas">
              <Plus size={18} />
              Nova venda
            </LinkButton>
            <LinkButton href="/clientes" variante="secundario">
              <UserPlus size={18} />
              Novo cliente
            </LinkButton>
            <LinkButton href="/parcelas" variante="secundario">
              <CalendarClock size={18} />
              Ver parcelas
            </LinkButton>
            <LinkButton href="/relatorio" variante="secundario">
              <FileChartColumn size={18} />
              Relatório do mês
            </LinkButton>
          </div>
        </Card>
      </div>
    </>
  );
}
