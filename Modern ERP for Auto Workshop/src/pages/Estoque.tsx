import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Package, AlertTriangle } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { SearchInput } from "../components/ui/SearchInput";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { ProdutoForm } from "../components/produto/ProdutoForm";
import { useToast } from "../components/ui/Toast";
import { estoqueService } from "../services/estoque";
import { fornecedoresService } from "../services/fornecedores";
import { generateId } from "../lib/mockStore";
import { formatCurrency } from "../lib/format";
import { produtoFormValuesVazio } from "../types/produto";
import type { Produto, ProdutoFormValues } from "../types/produto";
import type { Pessoa } from "../types/pessoa";

export default function Estoque() {
  const { notify } = useToast();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [fornecedores, setFornecedores] = useState<Pessoa[]>([]);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmacao, setConfirmacao] = useState<Produto | null>(null);

  async function carregar() {
    setCarregando(true);
    setProdutos(await estoqueService.listar());
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
    fornecedoresService.listar().then(setFornecedores).catch(() => setFornecedores([]));
  }, []);

  function abrirNovo() {
    setEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(produto: Produto) {
    setEditando(produto);
    setModalAberto(true);
  }

  async function salvar(valores: ProdutoFormValues) {
    setSalvando(true);
    const fornecedor = fornecedores.find((f) => f.id === valores.fornecedorId);
    try {
      if (editando) {
        await estoqueService.atualizar(editando.id, { ...valores, fornecedorNome: fornecedor?.nome_razao_social });
        notify("Produto atualizado.");
      } else {
        await estoqueService.criar({
          ...valores,
          id: generateId("prod"),
          fornecedorNome: fornecedor?.nome_razao_social,
          criadoEm: new Date().toISOString(),
        });
        notify("Produto cadastrado.");
      }
      setModalAberto(false);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function remover(produto: Produto) {
    await estoqueService.remover(produto.id);
    notify("Produto removido.");
    await carregar();
  }

  const filtrados = produtos.filter((p) => `${p.nome} ${p.categoria}`.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Estoque"
        description="Peças e produtos disponíveis para as ordens de serviço."
        action={
          <Button onClick={abrirNovo}>
            <Plus size={18} /> Novo produto
          </Button>
        }
      />

      <SearchInput
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome ou categoria"
        className="mb-4 max-w-sm"
      />

      {carregando ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-card bg-cream-dark" />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum produto encontrado"
          description="Cadastre peças e produtos para controlar o estoque da oficina."
          action={
            <Button onClick={abrirNovo}>
              <Plus size={18} /> Novo produto
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-cream-dark/50 text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-4 py-3 font-semibold">Produto</th>
                  <th className="px-4 py-3 font-semibold">Estoque</th>
                  <th className="px-4 py-3 font-semibold">Preço de venda</th>
                  <th className="px-4 py-3 font-semibold">Fornecedor</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtrados.map((produto) => {
                  const baixo = produto.quantidade < produto.quantidadeMinima;
                  return (
                    <tr key={produto.id} className="border-b border-border last:border-b-0 hover:bg-cream-dark/30">
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink">{produto.nome}</p>
                        <p className="text-xs text-ink-faint">{produto.categoria || "Sem categoria"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="tabular font-medium text-ink">
                            {produto.quantidade} {produto.unidade}
                          </span>
                          {baixo && (
                            <Badge tone="red">
                              <AlertTriangle size={11} /> baixo
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="tabular px-4 py-3 font-medium text-ink">{formatCurrency(produto.precoVenda)}</td>
                      <td className="px-4 py-3 text-ink-soft">{produto.fornecedorNome || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => abrirEdicao(produto)}>
                            <Pencil size={15} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setConfirmacao(produto)}>
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title={editando ? "Editar produto" : "Novo produto"} width="lg">
        <ProdutoForm
          valoresIniciais={editando ?? produtoFormValuesVazio}
          onSalvar={salvar}
          onCancelar={() => setModalAberto(false)}
          salvando={salvando}
          fornecedores={fornecedores}
        />
      </Modal>

      <ConfirmDialog
        open={!!confirmacao}
        onClose={() => setConfirmacao(null)}
        title="Remover produto?"
        description={`${confirmacao?.nome} será removido definitivamente do estoque.`}
        confirmLabel="Remover"
        danger
        onConfirm={() => confirmacao && remover(confirmacao)}
      />
    </div>
  );
}
