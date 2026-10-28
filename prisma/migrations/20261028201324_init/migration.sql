-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Vendedor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Venda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clienteId" INTEGER NOT NULL,
    "vendedorId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "valorTotal" REAL NOT NULL,
    "numeroParcelas" INTEGER,
    "dataVenda" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Venda_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Vendedor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Parcela" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendaId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "valor" REAL NOT NULL,
    "dataVencimento" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    CONSTRAINT "Parcela_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendaId" INTEGER NOT NULL,
    "parcelaId" INTEGER,
    "valorPago" REAL NOT NULL,
    "dataPagamento" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pagamento_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pagamento_parcelaId_fkey" FOREIGN KEY ("parcelaId") REFERENCES "Parcela" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
