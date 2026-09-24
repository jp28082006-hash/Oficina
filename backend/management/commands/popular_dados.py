"""
Popula o banco com dados genéricos e realistas para desenvolvimento/demo.

Uso:
    python manage.py popular_dados            # adiciona dados por cima do que já existe
    python manage.py popular_dados --reset     # apaga tudo antes de popular

CPF/CNPJ são gerados com dígito verificador real (mesmo algoritmo do
validate_docbr usado em backend/validadores.py) — números aleatórios
"chutados" seriam rejeitados pela validação do model/serializer.
"""

import random
import unicodedata
from datetime import timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from backend.models import Cliente, Fornecedor, Veiculo, Produto, OrdemServico, ItemOS, Lancamento


def _digito_modulo11(digitos, pesos):
    soma = sum(d * p for d, p in zip(digitos, pesos))
    resto = soma % 11
    return 0 if resto < 2 else 11 - resto


def gerar_cpf():
    while True:
        base = [random.randint(0, 9) for _ in range(9)]
        if len(set(base)) == 1:
            continue
        d1 = _digito_modulo11(base, list(range(10, 1, -1)))
        d2 = _digito_modulo11(base + [d1], list(range(11, 1, -1)))
        return "".join(map(str, base + [d1, d2]))


def _slug(texto):
    sem_acento = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return sem_acento.lower().split()[0]


def gerar_cnpj():
    while True:
        base = [random.randint(0, 9) for _ in range(8)] + [0, 0, 0, 1]
        if len(set(base)) == 1:
            continue
        pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        d1 = _digito_modulo11(base, pesos1)
        d2 = _digito_modulo11(base + [d1], pesos2)
        return "".join(map(str, base + [d1, d2]))


NOMES_PF = [
    "Marcos Andrade", "Fernanda Lima", "Ricardo Souza", "Juliana Prado", "Carlos Mendes",
    "Beatriz Ramos", "Rodrigo Alves", "Patrícia Gomes", "Eduardo Martins", "Camila Nunes",
    "Bruno Carvalho", "Larissa Rocha", "Felipe Barbosa", "Vanessa Teixeira", "André Pereira",
    "Renata Costa", "Gustavo Farias", "Aline Correia", "Thiago Ribeiro", "Débora Cardoso",
]

RAZOES_PJ_CLIENTE = [
    ("Transportadora Vale Verde Ltda", "Vale Verde Transportes"),
    ("Distribuidora Central de Alimentos ME", "Distribuidora Central"),
    ("Construtora Horizonte Ltda", "Construtora Horizonte"),
]

RAZOES_PJ_FORNECEDOR = [
    ("Auto Peças Bahia Ltda", "AutoPeças BA"),
    ("Distribuidora Nacional de Autopeças S.A.", "DNA Peças"),
    ("Pneus & Cia Comércio Ltda", "Pneus & Cia"),
    ("Lubrificantes Tork Distribuidora Ltda", "Tork Lubrificantes"),
    ("Baterias Moura Representação Ltda", "Moura Baterias"),
    ("Vidros e Acessórios Automotivos ME", "VidroCar"),
]

CIDADES = [
    ("Belo Horizonte", "MG", "30130-000"),
    ("São Paulo", "SP", "01310-000"),
    ("Rio de Janeiro", "RJ", "20040-020"),
    ("Curitiba", "PR", "80020-000"),
    ("Salvador", "BA", "40010-000"),
    ("Porto Alegre", "RS", "90010-000"),
]

LOGRADOUROS = ["Rua das Flores", "Av. Brasil", "Rua Sete de Setembro", "Av. Getúlio Vargas", "Rua XV de Novembro"]

VEICULOS_CATALOGO = [
    ("Volkswagen", "Gol"), ("Volkswagen", "Polo"), ("Chevrolet", "Onix"), ("Chevrolet", "Tracker"),
    ("Fiat", "Uno"), ("Fiat", "Toro"), ("Fiat", "Argo"), ("Honda", "Civic"), ("Honda", "HR-V"),
    ("Toyota", "Corolla"), ("Toyota", "Hilux"), ("Hyundai", "HB20"), ("Renault", "Kwid"),
    ("Jeep", "Renegade"), ("Nissan", "Kicks"),
]
CORES = ["Branco", "Prata", "Preto", "Cinza", "Vermelho", "Azul"]

PRODUTOS_CATALOGO = [
    ("Óleo de motor sintético 5W30 (litro)", "Lubrificantes", "un", 32, 58),
    ("Óleo de câmbio ATF", "Lubrificantes", "litro", 28, 49),
    ("Filtro de óleo", "Filtros", "un", 18, 35),
    ("Filtro de ar", "Filtros", "un", 28, 49),
    ("Filtro de combustível", "Filtros", "un", 24, 42),
    ("Filtro de cabine (ar condicionado)", "Filtros", "un", 22, 40),
    ("Pastilha de freio dianteira", "Freios", "jogo", 95, 150),
    ("Pastilha de freio traseira", "Freios", "jogo", 82, 135),
    ("Disco de freio ventilado", "Freios", "un", 110, 175),
    ("Amortecedor dianteiro", "Suspensão", "un", 165, 240),
    ("Amortecedor traseiro", "Suspensão", "un", 145, 215),
    ("Mola de suspensão", "Suspensão", "un", 90, 150),
    ("Kit embreagem completo", "Transmissão", "kit", 610, 890),
    ("Correia dentada", "Transmissão", "kit", 120, 190),
    ("Bateria automotiva 60Ah", "Elétrica", "un", 320, 480),
    ("Vela de ignição", "Elétrica", "jogo", 60, 110),
    ("Radiador de arrefecimento", "Arrefecimento", "un", 280, 420),
    ("Válvula termostática", "Arrefecimento", "un", 45, 80),
    ("Pneu aro 15", "Pneus", "un", 280, 399),
    ("Amortecedor de porta-malas (gás)", "Suspensão", "par", 70, 120),
    ("Palheta limpador de para-brisa", "Acessórios", "par", 25, 45),
    ("Lâmpada de farol H4", "Elétrica", "un", 20, 38),
]

MECANICOS = ["Paulo Mecânico", "Diego Silva", "Camila Torres", "Rafael Souza"]

SERVICOS_CATALOGO = [
    ("Troca de óleo e filtro", 90, 150),
    ("Alinhamento e balanceamento", 120, 180),
    ("Revisão completa", 250, 420),
    ("Troca de correia dentada", 180, 280),
    ("Diagnóstico eletrônico", 80, 130),
    ("Troca de embreagem", 300, 480),
    ("Troca de amortecedores (par)", 150, 240),
    ("Troca de pastilhas de freio", 100, 160),
    ("Higienização de ar condicionado", 90, 140),
    ("Troca de bateria", 40, 70),
]

STATUS_OS_PESOS = [
    ("aberta", 4), ("em_andamento", 3), ("aguardando_peca", 2),
    ("concluida", 4), ("entregue", 5), ("cancelada", 1),
]

DESCRICOES_PAGAR = [
    ("Aluguel do galpão", "Fixo"),
    ("Energia elétrica", "Fixo"),
    ("Água e esgoto", "Fixo"),
    ("Internet e telefone", "Fixo"),
    ("Compra de peças", "Compra de peças"),
    ("Manutenção de equipamentos", "Manutenção"),
    ("Contador", "Impostos"),
    ("Folha de pagamento", "Fixo"),
]


class Command(BaseCommand):
    help = "Popula o banco com clientes, fornecedores, veículos, produtos, OS e lançamentos genéricos."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Apaga todos os dados existentes antes de popular.",
        )

    def handle(self, *args, **options):
        if options["reset"]:
            self._resetar()

        clientes = self._criar_clientes()
        fornecedores = self._criar_fornecedores()
        veiculos = self._criar_veiculos(clientes)
        produtos = self._criar_produtos(fornecedores)
        ordens = self._criar_ordens_servico(clientes, veiculos)
        lancamentos = self._criar_lancamentos(ordens)

        self.stdout.write(self.style.SUCCESS(
            f"Pronto! Criados: {len(clientes)} clientes, {len(fornecedores)} fornecedores, "
            f"{len(veiculos)} veículos, {len(produtos)} produtos, {len(ordens)} ordens de serviço, "
            f"{len(lancamentos)} lançamentos financeiros."
        ))

    def _resetar(self):
        self.stdout.write("Apagando dados existentes...")
        OrdemServico.objects.all().delete()
        Lancamento.objects.all().delete()
        Veiculo.objects.all().delete()
        Produto.objects.all().delete()
        Cliente.objects.all().delete()
        Fornecedor.objects.all().delete()

    def _endereco_aleatorio(self):
        cidade, uf, cep = random.choice(CIDADES)
        return {
            "cep": cep.replace("-", ""),
            "logradouro": random.choice(LOGRADOUROS),
            "numero": str(random.randint(10, 2500)),
            "bairro": "Centro",
            "cidade": cidade,
            "uf": uf,
        }

    def _criar_clientes(self):
        clientes = []
        for nome in NOMES_PF:
            clientes.append(Cliente.objects.create(
                tipo_pessoa="PF",
                nome_razao_social=nome,
                cpf_cnpj=gerar_cpf(),
                telefone_principal=f"319{random.randint(10000000, 99999999)}",
                email=f"{_slug(nome)}@exemplo.com",
                **self._endereco_aleatorio(),
            ))
        for razao, fantasia in RAZOES_PJ_CLIENTE:
            clientes.append(Cliente.objects.create(
                tipo_pessoa="PJ",
                nome_razao_social=razao,
                nome_fantasia=fantasia,
                cpf_cnpj=gerar_cnpj(),
                telefone_principal=f"31{random.randint(30000000, 39999999)}",
                email=f"contato@{_slug(fantasia)}.com.br",
                **self._endereco_aleatorio(),
            ))
        return clientes

    def _criar_fornecedores(self):
        fornecedores = []
        for razao, fantasia in RAZOES_PJ_FORNECEDOR:
            fornecedores.append(Fornecedor.objects.create(
                tipo_pessoa="PJ",
                nome_razao_social=razao,
                nome_fantasia=fantasia,
                cpf_cnpj=gerar_cnpj(),
                telefone_principal=f"11{random.randint(30000000, 39999999)}",
                email=f"vendas@{_slug(fantasia)}.com.br",
                **self._endereco_aleatorio(),
            ))
        return fornecedores

    def _criar_veiculos(self, clientes):
        veiculos = []
        placas_usadas = set(Veiculo.objects.values_list("placa", flat=True))
        clientes_pf = [c for c in clientes if c.tipo_pessoa == "PF"]
        for cliente in clientes_pf:
            for _ in range(random.randint(1, 2)):
                marca, modelo = random.choice(VEICULOS_CATALOGO)
                ano = random.randint(2014, 2024)
                while True:
                    placa = f"{''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ', k=3))}{random.randint(0, 9)}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.randint(0, 9)}{random.randint(0, 9)}"
                    if placa not in placas_usadas:
                        placas_usadas.add(placa)
                        break
                veiculos.append(Veiculo.objects.create(
                    cliente=cliente,
                    placa=placa,
                    marca=marca,
                    modelo=modelo,
                    ano_fabricacao=ano,
                    ano_modelo=ano + random.choice([0, 0, 1]),
                    cor=random.choice(CORES),
                    km=random.randint(5000, 120000),
                ))
        return veiculos

    def _criar_produtos(self, fornecedores):
        produtos = []
        for i, (nome, categoria, unidade, custo, venda) in enumerate(PRODUTOS_CATALOGO):
            minima = random.choice([4, 5, 6, 8, 10])
            # ~1 a cada 5 produtos nasce abaixo do mínimo, pra gerar alerta de estoque baixo
            quantidade = random.randint(0, minima - 1) if i % 5 == 0 else random.randint(minima + 2, minima + 30)
            produtos.append(Produto.objects.create(
                nome=nome,
                categoria=categoria,
                quantidade=quantidade,
                quantidade_minima=minima,
                unidade=unidade,
                preco_custo=Decimal(custo),
                preco_venda=Decimal(venda),
                fornecedor=random.choice(fornecedores) if random.random() > 0.15 else None,
            ))
        return produtos

    def _criar_ordens_servico(self, clientes, veiculos):
        ordens = []
        hoje = timezone.localdate()
        status_pool = [s for s, peso in STATUS_OS_PESOS for _ in range(peso)]

        for _ in range(22):
            veiculo = random.choice(veiculos)
            status = random.choice(status_pool)

            if status in ("concluida", "entregue"):
                abertura = hoje - timedelta(days=random.randint(5, 30))
                previsao = abertura + timedelta(days=random.randint(1, 5))
            elif status == "cancelada":
                abertura = hoje - timedelta(days=random.randint(2, 20))
                previsao = abertura + timedelta(days=random.randint(1, 5))
            else:
                abertura = hoje - timedelta(days=random.randint(0, 6))
                # parte das OS ativas fica com previsão vencida, pra testar o alerta de atraso
                previsao = hoje + timedelta(days=random.randint(-3, 6))

            os_ = OrdemServico.objects.create(
                cliente=veiculo.cliente,
                veiculo=veiculo,
                status=status,
                mecanico_responsavel=random.choice(MECANICOS),
                data_abertura=abertura,
                data_previsao=previsao,
            )

            for _ in range(random.randint(1, 3)):
                if random.random() > 0.4:
                    descricao, minimo, maximo = random.choice(SERVICOS_CATALOGO)
                    tipo = "servico"
                else:
                    descricao, _categoria, _unidade, minimo, maximo = random.choice(PRODUTOS_CATALOGO)
                    tipo = "peca"
                ItemOS.objects.create(
                    ordem_servico=os_,
                    tipo=tipo,
                    descricao=descricao,
                    quantidade=random.randint(1, 2),
                    valor_unitario=Decimal(random.randint(minimo, maximo)),
                )
            ordens.append(os_)
        return ordens

    def _criar_lancamentos(self, ordens):
        lancamentos = []
        hoje = timezone.localdate()

        for os_ in ordens:
            if os_.status not in ("concluida", "entregue"):
                continue
            total = sum((item.quantidade * item.valor_unitario for item in os_.itens.all()), Decimal(0))
            if total <= 0:
                continue
            vencimento = os_.data_previsao + timedelta(days=random.randint(0, 5))
            if vencimento < hoje:
                status = random.choices(["pago", "atrasado"], weights=[7, 3])[0]
            else:
                status = random.choices(["pago", "pendente"], weights=[5, 5])[0]
            lancamentos.append(Lancamento.objects.create(
                tipo="receber",
                descricao=f"OS #{os_.numero} · {os_.cliente.nome_razao_social}",
                categoria="Serviços",
                valor=total,
                vencimento=vencimento,
                status=status,
                ordem_servico=os_,
            ))

        for descricao, categoria in DESCRICOES_PAGAR:
            vencimento = hoje + timedelta(days=random.randint(-10, 20))
            status = "pendente" if vencimento >= hoje else random.choice(["pago", "atrasado"])
            lancamentos.append(Lancamento.objects.create(
                tipo="pagar",
                descricao=descricao,
                categoria=categoria,
                valor=Decimal(random.randint(80, 3500)),
                vencimento=vencimento,
                status=status,
            ))

        return lancamentos
