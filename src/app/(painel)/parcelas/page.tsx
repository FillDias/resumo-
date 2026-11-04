import { Suspense } from "react";
import { connection } from "next/server";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CabecalhoDaPagina } from "@/components/ui/cabecalho-da-pagina";
import { Card } from "@/components/ui/card";
import { CampoSelect } from "@/components/ui/campo";
import { StatusBadge } from "@/components/ui/status-badge";
import { Celula, Linha, Tabela } from "@/components/ui/tabela";
import { listarNomesDeClientes } from "@/lib/db/clientes";
import { listarParcelas } from "@/lib/db/parcelas";
import { formatarData, formatarMoeda } from "@/lib/format";
import { filtrosDeSituacao, type FiltroSituacao } from "@/lib/types";
import { marcarParcelaComoPaga } from "./actions";
import { usuarioLogado } from "@/lib/auth/sessao";

const opcoesDeSituacao: { id: FiltroSituacao; nome: string }[] = [
  { id: "todas", nome: "Todas" },
  { id: "pendentes", nome: "Pendentes (a vencer)" },
  { id: "atrasadas", nome: "Atrasadas" },
  { id: "pagas", nome: "Pagas" },
];

export default function ParcelasPage({ searchParams }: PageProps<"/parcelas">) {
  return (
    <>
      <CabecalhoDaPagina titulo="Parcelas" descricao="Parcelas semanais das vendas parceladas" />

      <Suspense fallback={<p className="text-muted">Carregando parcelas...</p>}>
        <ConteudoDeParcelas searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ConteudoDeParcelas({ searchParams }: Pick<PageProps<"/parcelas">, "searchParams">) {
  await connection();
  const { cliente, situacao } = await searchParams;
  const clienteId = Number(cliente) || undefined;
  const filtroSituacao = filtrosDeSituacao.find((filtro) => filtro === situacao) ?? "todas";

  const usuario = await usuarioLogado();
  const [clientes, parcelas] = await Promise.all([
    listarNomesDeClientes(usuario.id),
    listarParcelas({ usuarioId: usuario.id, clienteId, situacao: filtroSituacao }),
  ]);
  const naoPagas = parcelas.filter((parcela) => parcela.situacao !== "PAGA");
  const atrasadas = parcelas.filter((parcela) => parcela.situacao === "ATRASADA");
  const somar = (lista: typeof parcelas) => lista.reduce((total, parcela) => total + parcela.valor, 0);

  return (
    <>
      <Card>
        <form action="/parcelas" className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
            <CampoSelect
              label="Cliente"
              name="cliente"
              placeholder="Todos os clientes"
              opcoes={clientes}
              defaultValue={clienteId}
            />
            <CampoSelect label="Situação" name="situacao" opcoes={opcoesDeSituacao} defaultValue={filtroSituacao} />
          </div>
          <Button type="submit" variante="secundario" className="w-full md:w-auto">
            Filtrar
          </Button>
        </form>
      </Card>

      <Card className="mt-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="text-base font-semibold">{parcelas.length} parcelas</h2>
          <p className="flex flex-wrap gap-x-4 text-muted">
            <span className="whitespace-nowrap">
              Em aberto <span className="font-semibold tabular-nums text-ink">{formatarMoeda(somar(naoPagas))}</span>
            </span>
            <span className="whitespace-nowrap">
              Em atraso <span className="font-semibold tabular-nums text-danger">{formatarMoeda(somar(atrasadas))}</span>
            </span>
          </p>
        </div>

        {parcelas.length === 0 ? (
          <p className="py-8 text-center text-muted">Nenhuma parcela encontrada com esses filtros.</p>
        ) : (
          <Tabela
            colunas={[
              { titulo: "Cliente" },
              { titulo: "Venda em", numerica: true },
              { titulo: "Parcela", numerica: true },
              { titulo: "Vencimento", numerica: true },
              { titulo: "Valor", numerica: true },
              { titulo: "Situação" },
              { titulo: "Pagamento", numerica: true },
            ]}
          >
            {parcelas.map((parcela) => (
              <Linha key={parcela.id}>
                <Celula rotulo="Cliente" className="font-medium">
                  {parcela.venda.cliente.nome}
                </Celula>
                <Celula rotulo="Venda em" numerica>
                  {formatarData(parcela.venda.dataVenda)}
                </Celula>
                <Celula rotulo="Parcela" numerica>
                  {parcela.numero}/{parcela.venda.numeroParcelas}
                </Celula>
                <Celula rotulo="Vencimento" numerica className={parcela.situacao === "ATRASADA" ? "font-medium text-danger" : ""}>
                  {formatarData(parcela.dataVencimento)}
                </Celula>
                <Celula rotulo="Valor" numerica className="font-semibold">
                  {formatarMoeda(parcela.valor)}
                </Celula>
                <Celula rotulo="Situação">
                  <StatusBadge situacao={parcela.situacao} />
                </Celula>
                <Celula rotulo="Pagamento" numerica className="md:py-2">
                  {parcela.dataPagamento ? (
                    <span className="text-muted">Paga em {formatarData(parcela.dataPagamento)}</span>
                  ) : (
                    <form action={marcarParcelaComoPaga.bind(null, parcela.id)}>
                      <Button type="submit" variante="secundario" className="h-8 px-3 text-xs">
                        <Check size={16} />
                        Marcar como paga
                      </Button>
                    </form>
                  )}
                </Celula>
              </Linha>
            ))}
          </Tabela>
        )}
      </Card>
    </>
  );
}
