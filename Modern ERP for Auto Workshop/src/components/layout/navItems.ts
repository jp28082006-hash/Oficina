import { Gauge, Users, Truck, CarFront, ClipboardList, Package, Wallet } from "lucide-react";

export const NAV_ITEMS = [
  { to: "/", label: "Painel", icon: Gauge, end: true },
  { to: "/clientes", label: "Clientes", icon: Users, end: false },
  { to: "/fornecedores", label: "Fornecedores", icon: Truck, end: false },
  { to: "/veiculos", label: "Veículos", icon: CarFront, end: false },
  { to: "/ordens-servico", label: "Ordens de Serviço", icon: ClipboardList, end: false },
  { to: "/estoque", label: "Estoque", icon: Package, end: false },
  { to: "/financeiro", label: "Financeiro", icon: Wallet, end: false },
] as const;
