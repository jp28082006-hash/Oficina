import { Routes, Route } from "react-router";
import { AppShell } from "./components/layout/AppShell";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Fornecedores from "./pages/Fornecedores";
import Veiculos from "./pages/Veiculos";
import OrdensServico from "./pages/OrdensServico";
import Estoque from "./pages/Estoque";
import Financeiro from "./pages/Financeiro";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="fornecedores" element={<Fornecedores />} />
        <Route path="veiculos" element={<Veiculos />} />
        <Route path="ordens-servico" element={<OrdensServico />} />
        <Route path="estoque" element={<Estoque />} />
        <Route path="financeiro" element={<Financeiro />} />
      </Route>
    </Routes>
  );
}
