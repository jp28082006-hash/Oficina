import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { estoqueService } from "../services/estoque";
import { ordensServicoService } from "../services/ordensServico";
import { financeiroService } from "../services/financeiro";

export interface Alerta {
  id: string;
  tipo: "estoque" | "os" | "financeiro";
  titulo: string;
  descricao: string;
  href: string;
}

const OS_ATIVAS_FORA_STATUS_FINAL = new Set(["concluida", "entregue", "cancelada"]);

export function useAlertas() {
  const location = useLocation();
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const [produtos, ordens, lancamentos] = await Promise.all([
        estoqueService.listar(),
        ordensServicoService.listar(),
        financeiroService.listar(),
      ]);
      if (!ativo) return;

      const hoje = new Date().toISOString().slice(0, 10);
      const lista: Alerta[] = [];

      produtos
        .filter((p) => p.quantidade < p.quantidadeMinima)
        .forEach((p) =>
          lista.push({
            id: `estoque_${p.id}`,
            tipo: "estoque",
            titulo: "Estoque baixo",
            descricao: `${p.nome} — restam ${p.quantidade} ${p.unidade}`,
            href: "/estoque",
          }),
        );

      ordens
        .filter((os) => os.dataPrevisao < hoje && !OS_ATIVAS_FORA_STATUS_FINAL.has(os.status))
        .forEach((os) =>
          lista.push({
            id: `os_${os.id}`,
            tipo: "os",
            titulo: `OS #${os.numero} atrasada`,
            descricao: os.clienteNome,
            href: "/ordens-servico",
          }),
        );

      lancamentos
        .filter((l) => l.status === "atrasado")
        .forEach((l) =>
          lista.push({
            id: `fin_${l.id}`,
            tipo: "financeiro",
            titulo: l.tipo === "pagar" ? "Conta a pagar atrasada" : "Recebimento atrasado",
            descricao: l.descricao,
            href: "/financeiro",
          }),
        );

      setAlertas(lista);
    }
    carregar();
    return () => {
      ativo = false;
    };
  }, [location.pathname]);

  return alertas;
}
