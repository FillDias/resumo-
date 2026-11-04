import { Suspense } from "react";
import { connection } from "next/server";
import { CalendarClock, FileChartColumn, Plus, UserPlus } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { CabecalhoDaPagina } from "@/components/ui/cabecalho-da-pagina";
import { Card } from "@/components/ui/card";
import { Metricas } from "@/components/ui/metricas";
import { usuarioLogado } from "@/lib/auth/sessao";
import { buscarResumoDoMes } from "@/lib/db/resumo";
import { formatarMesAno, formatarMoeda } from "@/lib/format";

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="text-muted">Carregando resumo...</p>}>
      <ResumoDoMes />
    </Suspense>
  );
}

async function ResumoDoMes() {
  await connection();
  const hoje = new Date();
  const usuario = await usuarioLogado();
  const resumo = await buscarResumoDoMes(usuario.id, hoje);

  return (
    <>
      <CabecalhoDaPagina titulo="Dashboard" descricao={`Resumo financeiro de ${formatarMesAno(hoje).toLowerCase()}`}>
        <LinkButton href="/vendas" className="w-full sm:w-auto">
          <Plus size={18} />
          Nova venda
        </LinkButton>
      </CabecalhoDaPagina>

      <Metricas
        itens={[
          {
            label: "Vendido no mês",
            valor: formatarMoeda(resumo.totalVendido),
            detalhe: `À vista ${formatarMoeda(resumo.vendidoAVista)} · Parcelado ${formatarMoeda(resumo.vendidoParcelado)}`,
          },
          {
            label: "Recebido no mês",
            valor: formatarMoeda(resumo.totalRecebido),
            detalhe: "Vendas à vista e parcelas pagas",
          },
          {
            label: "Em aberto",
            valor: formatarMoeda(resumo.valorEmAberto),
            detalhe: `${resumo.parcelasEmAberto} parcelas a receber`,
          },
          {
            label: "Em atraso",
            valor: formatarMoeda(resumo.valorEmAtraso),
            detalhe: `${resumo.parcelasEmAtraso} parcelas vencidas sem pagamento`,
            destaqueDePerigo: true,
          },
        ]}
      />

      <Card className="mt-6">
        <h2 className="text-base font-semibold">Atalhos</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
          <LinkButton href="/clientes" variante="secundario">
            <UserPlus size={18} />
            Novo cliente
          </LinkButton>
          <LinkButton href="/parcelas?situacao=atrasadas" variante="secundario">
            <CalendarClock size={18} />
            Ver parcelas em atraso
          </LinkButton>
          <LinkButton href="/relatorio" variante="secundario">
            <FileChartColumn size={18} />
            Relatório do mês
          </LinkButton>
        </div>
      </Card>
    </>
  );
}
