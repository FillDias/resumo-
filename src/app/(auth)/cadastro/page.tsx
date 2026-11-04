import { FormularioDeAcesso } from "../formulario-de-acesso";

export default function CadastroPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Criar conta</h1>
      <p className="mb-6 mt-1 text-muted">Cadastre sua empresa para acessar o painel.</p>
      <FormularioDeAcesso modo="cadastro" />
    </>
  );
}
