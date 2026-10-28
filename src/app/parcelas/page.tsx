import { Suspense } from "react";
import { connection } from "next/server";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CampoSelect } from "@/components/ui/campo";
import { StatusBadge } from "@/components/ui/status-badge";
import { Celula, Linha, Tabela } from "@/components/ui/tabela";
import { listarNomesDeClientes } from "@/lib/db/clientes";
import { listarParcelas } from "@/lib/db/parcelas";
import { formatarData, formatarMoeda } from "@/lib/format";
import { filtrosDeSituacao, type FiltroSituacao } from "@/lib/types";
import { marcarParcelaComoPaga } from "./actions";

const opcoesDeSituacao: { id: FiltroSituacao; nome: string }[] = [
  { id: "todas", nome: "Todas" },
  { id: "pendentes", nome: "Pendentes (a vencer)" },
  { id: "atrasadas", nome: "Atrasadas" },
  { id: "pagas", nome: "Pagas" },
];

export default function ParcelasPage({ searchParams }: PageProps<"/parcelas">) {
  return (
    <>
      <h1 className="text-2xl font-semibold">Parcelas</h1>
      <p className="mt-1 text-muted">Parcelas semanais das vendas parceladas</p>

      <Suspense fallback={<p className="mt-6 text-muted">Carregando parcelas...</p>}>
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

  const [clientes, parcelas] = await Promise.all([
    listarNomesDeClientes(),
    listarParcelas({ clienteId, situacao: filtroSituacao }),
  ]);
  const naoPagas = parcelas.filter((parcela) => parcela.situacao !== "PAGA");
  const atrasadas = parcelas.filter((parcela) => parcela.situacao === "ATRASADA");
  const somar = (lista: typeof parcelas) => lista.reduce((total, parcela) => total + parcela.valor, 0);

  return (
    <>
      <Card className="mt-6">
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
          <Button type="submit" variante="secundario">
            Filtrar
          </Button>
        </form>
      </Card>

      <Card className="mt-4">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-medium">{parcelas.length} parcelas</h2>
          <p className="text-muted">
            Em aberto <span className="font-semibold tabular-nums text-ink">{formatarMoeda(somar(naoPagas))}</span>
            <span className="mx-2">·</span>
            Em atraso <span className="font-semibold tabular-nums text-danger">{formatarMoeda(somar(atrasadas))}</span>
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
                <Celula className="font-medium">{parcela.venda.cliente.nome}</Celula>
                <Celula numerica>{formatarData(parcela.venda.dataVenda)}</Celula>
                <Celula numerica>
                  {parcela.numero}/{parcela.venda.numeroParcelas}
                </Celula>
                <Celula numerica className={parcela.situacao === "ATRASADA" ? "font-medium text-danger" : ""}>
                  {formatarData(parcela.dataVencimento)}
                </Celula>
                <Celula numerica className="font-semibold">
                  {formatarMoeda(parcela.valor)}
                </Celula>
                <Celula>
                  <StatusBadge situacao={parcela.situacao} />
                </Celula>
                <Celula numerica>
                  {parcela.dataPagamento ? (
                    <span className="text-muted">Paga em {formatarData(parcela.dataPagamento)}</span>
                  ) : (
                    <form action={marcarParcelaComoPaga.bind(null, parcela.id)}>
                      <Button type="submit" variante="secundario" className="px-3 py-1.5 text-xs">
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
