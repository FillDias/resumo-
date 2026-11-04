import { NextResponse, type NextRequest } from "next/server";
import { NOME_DO_COOKIE_DE_SESSAO } from "@/lib/auth/cookie";

const rotasPublicas = ["/login", "/cadastro"];

// Checagem otimista (só a presença do cookie); a validação da sessão no banco acontece em usuarioLogado().
export function proxy(request: NextRequest) {
  const rotaPublica = rotasPublicas.includes(request.nextUrl.pathname);
  if (!rotaPublica && !request.cookies.has(NOME_DO_COOKIE_DE_SESSAO)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
