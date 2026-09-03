import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ClipboardList, Wallet, Package, Users, ArrowRight, PackageX, ClipboardX } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardBody } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { useAlertas } from "../hooks/useAlertas";
import { ordensServicoService } from "../services/ordensServico";
import { estoqueService } from "../services/estoque";
import { financeiroService } from "../services/financeiro";
import { clientesService } from "../services/clientes";
import { formatCurrency, formatDate } from "../lib/format";
import { STATUS_OS_LABEL, STATUS_OS_TONE, calcularTotalOS } from "../types/ordemServico";
import type { OrdemServico } from "../types/ordemServico";
import type { Produto } from "../types/produto";
import type { Lancamento } from "../types/financeiro";

const primeiroNome = (nomeCompleto: string) => nomeCompleto.split(" ")[0];

export default function Dashboard() {
  const alertas = useAlertas();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [clientesAtivos, setClientesAtivos] = useState<number | null>(null);
  const [clientesIndisponivel, setClientesIndisponivel] = useState(false);

  useEffect(() => {
    ordensServicoService.listar().then(setOrdens);
    estoqueService.listar().then(setProdutos);
    financeiroService.listar().then(setLancamentos);
    clientesService
      .listar({ incluir_inativos: false })
      .then((lista) => setClientesAtivos(lista.length))
      .catch(() => setClientesIndisponivel(true));
  }, []);

  const osAtivas = ordens.filter((os) => !["concluida", "entregue", "cancelada"].includes(os.status));
  const estoqueBaixo = produtos.filter((p) => p.quantidade < p.quantidadeMinima);
  const faturamentoMes = lancamentos
    .filter((l) => l.tipo === "receber" && l.status === "pago")
    .reduce((s, l) => s + l.valor, 0);

  const osRecentes = useMemo(
    () => [...ordens].sort((a, b) => b.dataAbertura.localeCompare(a.dataAbertura)).slice(0, 5),
    [ordens],
  );

  const faturamentoMensal = useMemo(() => {
    const hoje = new Date();
    const meses = Array.from({ length: 6 }, (_, i) => {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
      const nomeMes = data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
      return {
        chave: `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`,
        mes: nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1),
        valor: 0,
      };
    });
    for (const lancamento of lancamentos) {
      if (lancamento.tipo !== "receber" || lancamento.status !== "pago") continue;
      const chave = lancamento.vencimento.slice(0, 7);
      const alvo = meses.find((m) => m.chave === chave);
      if (alvo) alvo.valor += lancamento.valor;
    }
    return meses;
  }, [lancamentos]);

  return (
    <div>
      <PageHeader title={`Bem-vindo de volta, ${primeiroNome("André Junior")}!`} description="Aqui está o retrato da oficina hoje." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="OS em andamento" value={String(osAtivas.length)} icon={ClipboardList} tone="blue" />
        <StatCard label="Recebido este mês" value={formatCurrency(faturamentoMes)} icon={Wallet} tone="teal" />
        <StatCard label="Itens em falta" value={String(estoqueBaixo.length)} icon={Package} tone="red" />
        <StatCard
          label="Clientes ativos"
          value={clientesIndisponivel ? "—" : clientesAtivos === null ? "…" : String(clientesAtivos)}
          icon={Users}
          tone="terracotta"
          sublabel={clientesIndisponivel ? "Backend indisponível" : undefined}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Faturamento dos últimos meses</CardTitle>
          </CardHeader>
          <CardBody className="pt-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={faturamentoMensal} margin={{ left: -20, right: 10 }}>
                <defs>
                  <linearGradient id="corFaturamento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d9631e" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#d9631e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#eaded0" />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fill: "#6f6259", fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6f6259", fontSize: 12 }}
                  tickFormatter={(v) => `${v / 1000}k`}
                  width={40}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #eaded0",
                    fontSize: 13,
                    fontFamily: "Inter, sans-serif",
                  }}
                />
                <Area type="monotone" dataKey="valor" stroke="#d9631e" strokeWidth={2.5} fill="url(#corFaturamento)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>OS por status</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-3 pt-4">
            {Object.entries(STATUS_OS_LABEL)
              .filter(([status]) => status !== "cancelada")
              .map(([status, label]) => {
                const qtd = ordens.filter((os) => os.status === status).length;
                const max = Math.max(ordens.length, 1);
                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <Badge tone={STATUS_OS_TONE[status as keyof typeof STATUS_OS_TONE]}>{label}</Badge>
                      <span className="tabular font-semibold text-ink-soft">{qtd}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-cream-dark">
                      <div
                        className="h-full rounded-full bg-terracotta-500"
                        style={{ width: `${(qtd / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ordens de serviço recentes</CardTitle>
            <Link to="/ordens-servico" className="flex items-center gap-1 text-sm font-semibold text-terracotta-600 hover:text-terracotta-700">
              Ver todas <ArrowRight size={15} />
            </Link>
          </CardHeader>
          <CardBody className="pt-4">
            {osRecentes.length === 0 ? (
              <EmptyState icon={ClipboardList} title="Nenhuma OS registrada ainda" />
            ) : (
              <div className="flex flex-col gap-2">
                {osRecentes.map((os) => (
                  <Link
                    key={os.id}
                    to="/ordens-servico"
                    className="flex items-center justify-between gap-3 rounded-control border border-border p-3 hover:bg-cream-dark/40"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        <span className="tabular text-terracotta-600">#{os.numero}</span> · {os.veiculoDescricao}
                      </p>
                      <p className="text-xs text-ink-faint">
                        {os.clienteNome} · aberta em {formatDate(os.dataAbertura)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="tabular hidden text-sm font-semibold text-ink sm:block">
                        {formatCurrency(calcularTotalOS(os.itens))}
                      </span>
                      <Badge tone={STATUS_OS_TONE[os.status]}>{STATUS_OS_LABEL[os.status]}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-col gap-2 pt-4">
            {alertas.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-faint">Tudo em dia por aqui.</p>
            ) : (
              alertas.slice(0, 6).map((alerta) => {
                const Icon = alerta.tipo === "estoque" ? PackageX : alerta.tipo === "os" ? ClipboardX : Wallet;
                return (
                  <Link
                    key={alerta.id}
                    to={alerta.href}
                    className="flex items-start gap-2.5 rounded-control p-2 hover:bg-cream-dark/40"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <Icon size={14} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-ink">{alerta.titulo}</span>
                      <span className="block text-xs text-ink-soft">{alerta.descricao}</span>
                    </span>
                  </Link>
                );
              })
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
