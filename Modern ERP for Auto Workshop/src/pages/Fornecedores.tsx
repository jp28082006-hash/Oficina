import { Truck } from "lucide-react";
import { PessoaPage } from "./PessoaPage";
import { fornecedoresService } from "../services/fornecedores";

export default function Fornecedores() {
  return (
    <PessoaPage
      titulo="Fornecedores"
      descricao="Cadastro de fornecedores pessoa física e jurídica."
      labelSingular="Fornecedor"
      service={fornecedoresService}
      icone={Truck}
    />
  );
}
