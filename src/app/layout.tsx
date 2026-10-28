import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resumo+",
  description: "Controle financeiro de vendas",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased`}>
      <body className="flex min-h-screen bg-bg font-sans text-sm text-ink">
        <Sidebar />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl p-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
