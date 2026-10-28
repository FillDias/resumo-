import { prisma } from "../src/lib/db/prisma";
import { criarVenda } from "../src/lib/db/vendas";
import { registrarPagamentoDaParcela } from "../src/lib/db/parcelas";
import { gerarHashDaSenha } from "../src/lib/auth/senha";

const contaDeDemonstracao = { email: "contato@damassio.com.br", senha: "damassio123", cnpj: "11222333000181" };

const vendedores = [
  { nome: "Renata Souza", email: "renata@damassio.com.br" },
  { nome: "Marcos Oliveira", email: "marcos@damassio.com.br" },
  { nome: "Juliana Ferreira", email: "juliana@damassio.com.br" },
];

const clientes = [
  { nome: "Studio Bella Hair", telefone: "(27) 99812-4471", email: "contato@studiobellahair.com.br" },
  { nome: "Salão Charme & Estilo", telefone: "(27) 99734-2208", email: null },
  { nome: "Espaço Beleza Pura", telefone: "(27) 98845-1930", email: "belezapura.vv@gmail.com" },
  { nome: "Salão Glamour Praia da Costa", telefone: "(27) 99627-5583", email: "glamourpraiadacosta@gmail.com" },
  { nome: "Studio Cachos & Cia", telefone: "(27) 98112-6649", email: null },
  { nome: "Instituto Lumière Beauty", telefone: "(27) 99550-3817", email: "agenda@lumierebeauty.com.br" },
  { nome: "Salão Raízes Itapuã", telefone: "(27) 98473-9026", email: null },
];

type VendaDeExemplo = {
  cliente: number;
  vendedor: number;
  valorTotal: number;
  diasAtras: number;
  numeroParcelas?: number;
  parcelasPagasMesmoVencidas?: number;
};

// Sem numeroParcelas = à vista. Em vendas parceladas, todas as parcelas vencidas são pagas,
// exceto quando parcelasPagasMesmoVencidas limita (cliente inadimplente, gera atraso).
const vendas: VendaDeExemplo[] = [
  { cliente: 4, vendedor: 0, valorTotal: 267.3, diasAtras: 0 },
  { cliente: 0, vendedor: 0, valorTotal: 486.9, diasAtras: 2 },
  { cliente: 1, vendedor: 1, valorTotal: 1840, diasAtras: 6, numeroParcelas: 4 },
  { cliente: 2, vendedor: 2, valorTotal: 312.5, diasAtras: 9 },
  { cliente: 3, vendedor: 0, valorTotal: 2760, diasAtras: 12, numeroParcelas: 6 },
  { cliente: 4, vendedor: 1, valorTotal: 945, diasAtras: 20, numeroParcelas: 3, parcelasPagasMesmoVencidas: 1 },
  { cliente: 5, vendedor: 2, valorTotal: 728.4, diasAtras: 25 },
  { cliente: 6, vendedor: 0, valorTotal: 1650, diasAtras: 33, numeroParcelas: 5 },
  { cliente: 0, vendedor: 1, valorTotal: 539, diasAtras: 38 },
  { cliente: 2, vendedor: 2, valorTotal: 1320, diasAtras: 42, numeroParcelas: 4, parcelasPagasMesmoVencidas: 2 },
  { cliente: 5, vendedor: 0, valorTotal: 3480, diasAtras: 50, numeroParcelas: 8 },
  { cliente: 3, vendedor: 1, valorTotal: 415.8, diasAtras: 54 },
  { cliente: 1, vendedor: 2, valorTotal: 1180, diasAtras: 58, numeroParcelas: 4, parcelasPagasMesmoVencidas: 1 },
];

function diasAtrasAoMeioDia(dias: number) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  data.setHours(12, 0, 0, 0);
  return data;
}

async function main() {
  await prisma.pagamento.deleteMany();
  await prisma.parcela.deleteMany();
  await prisma.venda.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.vendedor.deleteMany();
  await prisma.sessao.deleteMany();
  await prisma.usuario.deleteMany();

  const { senha, ...dadosDaConta } = contaDeDemonstracao;
  const usuario = await prisma.usuario.create({
    data: { ...dadosDaConta, senhaHash: await gerarHashDaSenha(senha) },
  });

  const vendedoresCriados = await Promise.all(vendedores.map((vendedor) => prisma.vendedor.create({ data: { ...vendedor, usuarioId: usuario.id } })));
  const clientesCriados = [];
  for (const [indice, cliente] of clientes.entries()) {
    clientesCriados.push(
      await prisma.cliente.create({ data: { ...cliente, usuarioId: usuario.id, createdAt: diasAtrasAoMeioDia(70 - indice * 3) } }),
    );
  }

  const agora = new Date();
  for (const venda of [...vendas].reverse()) {
    const vendaCriada = await criarVenda(usuario.id, {
      clienteId: clientesCriados[venda.cliente].id,
      vendedorId: vendedoresCriados[venda.vendedor].id,
      tipo: venda.numeroParcelas ? "PARCELADA" : "AVISTA",
      valorTotal: venda.valorTotal,
      numeroParcelas: venda.numeroParcelas,
      dataVenda: diasAtrasAoMeioDia(venda.diasAtras),
    });

    const parcelasVencidas = await prisma.parcela.findMany({
      where: { vendaId: vendaCriada.id, dataVencimento: { lte: agora } },
      orderBy: { numero: "asc" },
      take: venda.parcelasPagasMesmoVencidas,
    });
    for (const parcela of parcelasVencidas) {
      await registrarPagamentoDaParcela(usuario.id, parcela.id, parcela.dataVencimento);
    }
  }
}

main().finally(() => prisma.$disconnect());
