import { Users } from "lucide-react";
import { PessoaPage } from "./PessoaPage";
import { clientesService } from "../services/clientes";

export default function Clientes() {
  return (
    <PessoaPage
      titulo="Clientes"
      descricao="Cadastro de clientes pessoa física e jurídica."
      labelSingular="Cliente"
      service={clientesService}
      icone={Users}
    />
  );
}
