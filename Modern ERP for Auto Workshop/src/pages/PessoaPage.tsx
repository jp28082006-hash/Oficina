import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Plus, Pencil, RotateCcw, UserX, Mail, Phone, MapPin } from "lucide-react";
import { PageHeader } from "../components/ui/PageHeader";
import { SearchInput } from "../components/ui/SearchInput";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { EmptyState } from "../components/ui/EmptyState";
import { PessoaForm } from "../components/pessoa/PessoaForm";
import { useToast } from "../components/ui/Toast";
import { ApiError } from "../lib/api";
import { formatCpfCnpj, formatPhone } from "../lib/format";
import { pessoaFormValuesVazio } from "../types/pessoa";
import type { Pessoa, PessoaFormValues } from "../types/pessoa";
import type { createPessoaService } from "../services/pessoaService";

interface PessoaPageProps {
  titulo: string;
  descricao: string;
  labelSingular: string;
  service: ReturnType<typeof createPessoaService>;
  icone: typeof UserX;
}

export function PessoaPage({ titulo, descricao, labelSingular, service, icone: Icone }: PessoaPageProps) {
  const { notify } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [incluirInativos, setIncluirInativos] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [pessoaEditando, setPessoaEditando] = useState<Pessoa | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroServidor, setErroServidor] = useState<Record<string, string[]>>();
  const [confirmacao, setConfirmacao] = useState<Pessoa | null>(null);

  async function carregar() {
    setCarregando(true);
    setErroCarga(null);
    try {
      const dados = await service.listar({ busca, incluir_inativos: incluirInativos });
      setPessoas(dados);
    } catch (err) {
      setErroCarga(
        err instanceof ApiError ? err.message : "Não foi possível carregar os dados.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(carregar, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, incluirInativos]);

  useEffect(() => {
    const idParam = searchParams.get("abrir");
    if (!idParam || pessoas.length === 0) return;
    const alvo = pessoas.find((p) => p.id === Number(idParam));
    if (alvo) abrirEdicao(alvo);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, pessoas]);

  function abrirNovo() {
    setPessoaEditando(null);
    setErroServidor(undefined);
    setModalAberto(true);
  }

  function abrirEdicao(pessoa: Pessoa) {
    setPessoaEditando(pessoa);
    setErroServidor(undefined);
    setModalAberto(true);
  }

  async function salvar(valores: PessoaFormValues) {
    setSalvando(true);
    setErroServidor(undefined);
    try {
      if (pessoaEditando) {
        await service.atualizar(pessoaEditando.id, valores);
        notify(`${labelSingular} atualizado com sucesso.`);
      } else {
        await service.criar(valores);
        notify(`${labelSingular} cadastrado com sucesso.`);
      }
      setModalAberto(false);
      await carregar();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setErroServidor(err.fieldErrors);
      } else {
        notify(err instanceof ApiError ? err.message : "Não foi possível salvar.", "error");
      }
    } finally {
      setSalvando(false);
    }
  }

  async function inativar(pessoa: Pessoa) {
    try {
      await service.inativar(pessoa.id);
      notify(`${labelSingular} inativado.`);
      await carregar();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Não foi possível inativar.", "error");
    }
  }

  async function reativar(pessoa: Pessoa) {
    try {
      await service.reativar(pessoa.id);
      notify(`${labelSingular} reativado.`);
      await carregar();
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Não foi possível reativar.", "error");
    }
  }

  return (
    <div>
      <PageHeader
        title={titulo}
        description={descricao}
        action={
          <Button onClick={abrirNovo}>
            <Plus size={18} /> Novo {labelSingular}
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={`Buscar por nome, documento ou e-mail`}
          className="max-w-sm flex-1"
        />
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={incluirInativos}
            onChange={(e) => setIncluirInativos(e.target.checked)}
            className="h-4 w-4 rounded border-border-strong text-terracotta-500 focus:ring-terracotta-200"
          />
          Incluir inativos
        </label>
      </div>

      {erroCarga && (
        <Card className="mb-4 border-red-100 bg-red-50 p-4 text-sm text-red-600">{erroCarga}</Card>
      )}

      {carregando ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-card bg-cream-dark" />
          ))}
        </div>
      ) : pessoas.length === 0 ? (
        <EmptyState
          icon={Icone}
          title={`Nenhum ${labelSingular.toLowerCase()} encontrado`}
          description={
            busca
              ? "Tente ajustar sua busca ou os filtros."
              : `Cadastre o primeiro ${labelSingular.toLowerCase()} para começar.`
          }
          action={
            !busca && (
              <Button onClick={abrirNovo}>
                <Plus size={18} /> Novo {labelSingular}
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-3">
          {pessoas.map((pessoa) => (
            <Card key={pessoa.id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <p className="font-display text-base font-semibold text-ink">{pessoa.nome_razao_social}</p>
                    <Badge tone={pessoa.tipo_pessoa === "PF" ? "blue" : "terracotta"}>
                      {pessoa.tipo_pessoa === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                    </Badge>
                    {!pessoa.ativo && <Badge tone="neutral">Inativo</Badge>}
                  </div>
                  {pessoa.nome_fantasia && <p className="mb-1.5 text-sm text-ink-soft">{pessoa.nome_fantasia}</p>}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
                    <span className="tabular">{formatCpfCnpj(pessoa.cpf_cnpj)}</span>
                    <span className="flex items-center gap-1.5">
                      <Phone size={14} /> {formatPhone(pessoa.telefone_principal)}
                    </span>
                    {pessoa.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} /> {pessoa.email}
                      </span>
                    )}
                    {pessoa.cidade && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} /> {pessoa.cidade}
                        {pessoa.uf ? `/${pessoa.uf}` : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" size="sm" onClick={() => abrirEdicao(pessoa)}>
                    <Pencil size={15} /> Editar
                  </Button>
                  {pessoa.ativo ? (
                    <Button variant="ghost" size="sm" onClick={() => setConfirmacao(pessoa)}>
                      <UserX size={15} /> Inativar
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => reativar(pessoa)}>
                      <RotateCcw size={15} /> Reativar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title={pessoaEditando ? `Editar ${labelSingular.toLowerCase()}` : `Novo ${labelSingular.toLowerCase()}`}
        width="lg"
      >
        <PessoaForm
          valoresIniciais={pessoaEditando ?? pessoaFormValuesVazio}
          onSalvar={salvar}
          onCancelar={() => setModalAberto(false)}
          erroServidor={erroServidor}
          salvando={salvando}
        />
      </Modal>

      <ConfirmDialog
        open={!!confirmacao}
        onClose={() => setConfirmacao(null)}
        title={`Inativar ${labelSingular.toLowerCase()}?`}
        description={`${confirmacao?.nome_razao_social} não aparecerá mais nas listagens padrão. Você pode reativar quando quiser.`}
        confirmLabel="Inativar"
        danger
        onConfirm={() => confirmacao && inativar(confirmacao)}
      />
    </div>
  );
}
