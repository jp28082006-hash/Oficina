import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Search, Users, Truck, CarFront, ClipboardList, Gauge } from "lucide-react";
import { clientesService } from "../../services/clientes";
import { fornecedoresService } from "../../services/fornecedores";
import { veiculosService } from "../../services/veiculos";
import { ordensServicoService } from "../../services/ordensServico";
import { STATUS_OS_LABEL } from "../../types/ordemServico";

type Categoria = "cliente" | "fornecedor" | "veiculo" | "os" | "atalho";

interface Resultado {
  id: string;
  categoria: Categoria;
  titulo: string;
  subtitulo: string;
  href: string;
}

const ICONE: Record<Categoria, typeof Users> = {
  cliente: Users,
  fornecedor: Truck,
  veiculo: CarFront,
  os: ClipboardList,
  atalho: Gauge,
};

const ATALHOS: Resultado[] = [
  { id: "painel", categoria: "atalho", titulo: "Painel", subtitulo: "Visão geral da oficina", href: "/" },
  { id: "clientes", categoria: "atalho", titulo: "Clientes", subtitulo: "Cadastro de clientes", href: "/clientes" },
  { id: "fornecedores", categoria: "atalho", titulo: "Fornecedores", subtitulo: "Cadastro de fornecedores", href: "/fornecedores" },
  { id: "veiculos", categoria: "atalho", titulo: "Veículos", subtitulo: "Veículos atendidos", href: "/veiculos" },
  { id: "os", categoria: "atalho", titulo: "Ordens de Serviço", subtitulo: "Kanban, lista e calendário", href: "/ordens-servico" },
  { id: "estoque", categoria: "atalho", titulo: "Estoque", subtitulo: "Peças e produtos", href: "/estoque" },
  { id: "financeiro", categoria: "atalho", titulo: "Financeiro", subtitulo: "Contas a pagar e receber", href: "/financeiro" },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [base, setBase] = useState<Resultado[]>([]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setIndiceAtivo(0);
    setCarregando(true);
    Promise.all([
      clientesService.listar().catch(() => []),
      fornecedoresService.listar().catch(() => []),
      veiculosService.listar().catch(() => []),
      ordensServicoService.listar().catch(() => []),
    ]).then(([clientes, fornecedores, veiculos, ordens]) => {
      setBase([
        ...clientes.map((c) => ({
          id: `cliente_${c.id}`,
          categoria: "cliente" as const,
          titulo: c.nome_razao_social,
          subtitulo: c.telefone_principal || c.email || "Cliente",
          href: `/clientes?abrir=${c.id}`,
        })),
        ...fornecedores.map((f) => ({
          id: `fornecedor_${f.id}`,
          categoria: "fornecedor" as const,
          titulo: f.nome_razao_social,
          subtitulo: f.telefone_principal || f.email || "Fornecedor",
          href: `/fornecedores?abrir=${f.id}`,
        })),
        ...veiculos.map((v) => ({
          id: `veiculo_${v.id}`,
          categoria: "veiculo" as const,
          titulo: `${v.modelo} · ${v.placa}`,
          subtitulo: v.clienteNome,
          href: `/veiculos?abrir=${v.id}`,
        })),
        ...ordens.map((os) => ({
          id: `os_${os.id}`,
          categoria: "os" as const,
          titulo: `OS #${os.numero} · ${os.veiculoDescricao}`,
          subtitulo: `${os.clienteNome} · ${STATUS_OS_LABEL[os.status]}`,
          href: `/ordens-servico?abrir=${os.id}`,
        })),
      ]);
      setCarregando(false);
    });
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  useEffect(() => {
    setIndiceAtivo(0);
  }, [query]);

  const resultados = useMemo(() => {
    if (!query.trim()) return ATALHOS;
    const q = query.toLowerCase();
    return base.filter((r) => `${r.titulo} ${r.subtitulo}`.toLowerCase().includes(q)).slice(0, 20);
  }, [query, base]);

  function ir(resultado: Resultado) {
    navigate(resultado.href);
    onClose();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceAtivo((i) => Math.min(i + 1, resultados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceAtivo((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const alvo = resultados[indiceAtivo];
      if (alvo) ir(alvo);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-xl overflow-hidden rounded-card border border-border bg-surface shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search size={18} className="text-ink-faint" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar cliente, veículo, OS, fornecedor…"
                className="h-8 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
              <kbd className="rounded border border-border-strong bg-cream-dark px-1.5 py-0.5 text-[10px] font-semibold text-ink-faint">
                Esc
              </kbd>
            </div>

            <div className="max-h-96 overflow-y-auto py-2">
              {carregando && query ? (
                <p className="px-4 py-6 text-center text-sm text-ink-faint">Carregando…</p>
              ) : resultados.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-ink-faint">Nada encontrado para "{query}".</p>
              ) : (
                resultados.map((r, i) => {
                  const Icon = ICONE[r.categoria];
                  return (
                    <button
                      key={r.id}
                      onMouseEnter={() => setIndiceAtivo(i)}
                      onClick={() => ir(r)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        i === indiceAtivo ? "bg-terracotta-50" : ""
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-dark text-ink-soft">
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">{r.titulo}</span>
                        <span className="block truncate text-xs text-ink-faint">{r.subtitulo}</span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
