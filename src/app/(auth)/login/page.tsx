import { FormularioDeAcesso } from "../formulario-de-acesso";

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Entrar</h1>
      <p className="mb-6 mt-1 text-muted">Acesse o painel com seu e-mail e senha.</p>
      <FormularioDeAcesso modo="login" />
    </>
  );
}
