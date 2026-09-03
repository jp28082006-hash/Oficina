from django.db import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from .validadores import documento_e_valido


class Cliente(models.Model):
    """
    Cadastro de Cliente (Pessoa Física ou Jurídica).

    DECISÕES DE DESIGN:
    - Soft delete via campo `ativo`. NUNCA fazer hard delete de Cliente que
      tenha Veículo, Ordem de Serviço ou Venda vinculada.
    - CPF/CNPJ: validação REAL de dígito verificador via `validate_docbr`
      (não é só checagem de tamanho/formato).
    - Endereço embutido no próprio registro (não normalizado em tabela
      separada) — confirmado como suficiente por enquanto.
    """

    class TipoPessoa(models.TextChoices):
        FISICA = "PF", "Pessoa Física"
        JURIDICA = "PJ", "Pessoa Jurídica"

    somente_digitos = RegexValidator(
        regex=r"^\d+$",
        message="Este campo deve conter apenas dígitos numéricos.",
    )

    tipo_pessoa = models.CharField(
        max_length=2,
        choices=TipoPessoa.choices,
        default=TipoPessoa.FISICA,
    )

    nome_razao_social = models.CharField(
        max_length=150,
        verbose_name="Nome / Razão Social",
    )

    nome_fantasia = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        help_text="Preenchido apenas para Pessoa Jurídica.",
    )

    cpf_cnpj = models.CharField(
        max_length=14,
        unique=True,
        validators=[somente_digitos],
        help_text="Somente números. 11 dígitos (CPF) ou 14 (CNPJ).",
    )

    rg_ie = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name="RG / Inscrição Estadual",
    )

    email = models.EmailField(blank=True, null=True)

    telefone_principal = models.CharField(
        max_length=15,
        validators=[somente_digitos],
        help_text="Somente números, com DDD. Ex: 31999998888",
    )

    telefone_secundario = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[somente_digitos],
    )

    # Endereço — embutido por decisão confirmada
    cep = models.CharField(max_length=8, validators=[somente_digitos], blank=True, null=True)
    logradouro = models.CharField(max_length=150, blank=True, null=True)
    numero = models.CharField(max_length=10, blank=True, null=True)
    complemento = models.CharField(max_length=100, blank=True, null=True)
    bairro = models.CharField(max_length=100, blank=True, null=True)
    cidade = models.CharField(max_length=100, blank=True, null=True)
    uf = models.CharField(max_length=2, blank=True, null=True)

    observacoes = models.TextField(blank=True, null=True)

    ativo = models.BooleanField(
        default=True,
        help_text="Soft delete: marcar como False em vez de excluir o registro.",
    )

    data_cadastro = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "cliente"
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"
        ordering = ["nome_razao_social"]

    def clean(self):
        """
        Validação REAL de CPF/CNPJ (dígito verificador) conforme tipo de
        pessoa. Repetida aqui (além do serializer) para garantir integridade
        mesmo se o registro for criado fora da API (admin, shell, script).
        """
        valido, erro = documento_e_valido(self.tipo_pessoa, self.cpf_cnpj)
        if not valido:
            raise ValidationError({"cpf_cnpj": erro})

    def __str__(self):
        return f"{self.nome_razao_social} ({self.cpf_cnpj})"


class Fornecedor(models.Model):
    """
    Cadastro de Fornecedor (Pessoa Física ou Jurídica).

    DECISÕES DE DESIGN (espelhando Cliente, pelas mesmas razões):
    - Soft delete via campo `ativo`. NUNCA fazer hard delete de Fornecedor
      que já tenha histórico de preço ou compra vinculada.
    - CPF/CNPJ: validação REAL de dígito verificador via `documento_e_valido`
      (compartilhada com Cliente — mesma regra, um lugar só).
    - Endereço embutido no próprio registro, igual Cliente, por consistência.

    PENDENTE: histórico de preço por fornecedor/produto (fornecedor_produto)
    NÃO foi criado ainda porque o model Produto não existe neste app.
    Quando Produto existir, criar essa tabela como FK real pra cá e pra lá.
    """

    class TipoPessoa(models.TextChoices):
        FISICA = "PF", "Pessoa Física"
        JURIDICA = "PJ", "Pessoa Jurídica"

    somente_digitos = RegexValidator(
        regex=r"^\d+$",
        message="Este campo deve conter apenas dígitos numéricos.",
    )

    tipo_pessoa = models.CharField(
        max_length=2,
        choices=TipoPessoa.choices,
        default=TipoPessoa.JURIDICA,
    )

    nome_razao_social = models.CharField(
        max_length=150,
        verbose_name="Nome / Razão Social",
    )

    nome_fantasia = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        help_text="Preenchido apenas para Pessoa Jurídica.",
    )

    cpf_cnpj = models.CharField(
        max_length=14,
        unique=True,
        validators=[somente_digitos],
        help_text="Somente números. 11 dígitos (CPF) ou 14 (CNPJ).",
    )

    email = models.EmailField(blank=True, null=True)

    telefone_principal = models.CharField(
        max_length=15,
        validators=[somente_digitos],
        help_text="Somente números, com DDD. Ex: 31999998888",
    )

    telefone_secundario = models.CharField(
        max_length=15,
        blank=True,
        null=True,
        validators=[somente_digitos],
    )

    # Endereço — embutido, mesmo padrão de Cliente
    cep = models.CharField(max_length=8, validators=[somente_digitos], blank=True, null=True)
    logradouro = models.CharField(max_length=150, blank=True, null=True)
    numero = models.CharField(max_length=10, blank=True, null=True)
    complemento = models.CharField(max_length=100, blank=True, null=True)
    bairro = models.CharField(max_length=100, blank=True, null=True)
    cidade = models.CharField(max_length=100, blank=True, null=True)
    uf = models.CharField(max_length=2, blank=True, null=True)

    observacoes = models.TextField(blank=True, null=True)

    ativo = models.BooleanField(
        default=True,
        help_text="Soft delete: marcar como False em vez de excluir o registro.",
    )

    data_cadastro = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "fornecedor"
        verbose_name = "Fornecedor"
        verbose_name_plural = "Fornecedores"
        ordering = ["nome_razao_social"]

    def clean(self):
        valido, erro = documento_e_valido(self.tipo_pessoa, self.cpf_cnpj)
        if not valido:
            raise ValidationError({"cpf_cnpj": erro})

    def __str__(self):
        return f"{self.nome_razao_social} ({self.cpf_cnpj})"


class Veiculo(models.Model):
    """
    Veículo de um Cliente, atendido pela oficina.

    DECISÕES DE DESIGN (mesmo padrão de Cliente/Fornecedor):
    - Soft delete via `ativo`, pelo mesmo motivo: uma OS antiga não pode
      ficar com uma FK quebrada só porque o veículo foi "removido" na UI.
    - `cliente` usa PROTECT: nunca deixar o Django apagar em cascata o
      histórico de veículos de um cliente (a ClienteViewSet já nem expõe
      hard delete, mas isso protege contra admin/shell também).
    """

    placa_regex = RegexValidator(
        regex=r"^[A-Z]{3}\d[A-Z0-9]\d{2}$",
        message="Placa inválida. Use o formato ABC1234 ou ABC1D23 (Mercosul).",
    )

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name="veiculos",
    )

    placa = models.CharField(max_length=7, unique=True, validators=[placa_regex])
    marca = models.CharField(max_length=60)
    modelo = models.CharField(max_length=80)
    ano_fabricacao = models.PositiveSmallIntegerField()
    ano_modelo = models.PositiveSmallIntegerField()
    cor = models.CharField(max_length=40, blank=True, null=True)
    km = models.PositiveIntegerField(default=0, verbose_name="Quilometragem")
    observacoes = models.TextField(blank=True, null=True)

    ativo = models.BooleanField(default=True)

    data_cadastro = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "veiculo"
        verbose_name = "Veículo"
        verbose_name_plural = "Veículos"
        ordering = ["-data_cadastro"]

    def clean(self):
        if self.placa:
            self.placa = self.placa.upper().replace("-", "").replace(" ", "")

    def __str__(self):
        return f"{self.modelo} · {self.placa}"


class Produto(models.Model):
    """
    Peça ou produto do estoque da oficina.

    DECISÃO: soft delete via `ativo`, mesmo padrão dos demais cadastros —
    um ItemOS antigo não pode perder a referência ao produto usado na época.
    """

    nome = models.CharField(max_length=150)
    categoria = models.CharField(max_length=80, blank=True, null=True)
    quantidade = models.PositiveIntegerField(default=0)
    quantidade_minima = models.PositiveIntegerField(
        default=0,
        help_text="Abaixo desta quantidade, o produto entra nos alertas de estoque baixo.",
    )
    unidade = models.CharField(max_length=20, default="un")
    preco_custo = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    preco_venda = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    fornecedor = models.ForeignKey(
        Fornecedor,
        on_delete=models.SET_NULL,
        related_name="produtos",
        blank=True,
        null=True,
    )

    ativo = models.BooleanField(default=True)

    data_cadastro = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "produto"
        verbose_name = "Produto"
        verbose_name_plural = "Produtos"
        ordering = ["nome"]

    def __str__(self):
        return self.nome


class OrdemServico(models.Model):
    """
    Ordem de Serviço (OS): o núcleo operacional da oficina.

    DECISÕES DE DESIGN:
    - `numero` é um número de OS sequencial e legível pro cliente/mecânico
      (começa em 1000), separado do `id` interno — auto-atribuído em
      `save()` na primeira gravação, nunca pelo cliente da API.
    - `cliente` e `veiculo` usam PROTECT: uma OS é documento fiscal/
      histórico, nunca deve virar órfã por causa de um hard delete em
      outro lugar.
    - Sem `ativo`/soft delete aqui: o ciclo de vida da OS é modelado pelo
      próprio `status` (inclusive "cancelada"), que já cobre o caso de
      "isso não vale mais" sem esconder o registro.
    """

    class Status(models.TextChoices):
        ABERTA = "aberta", "Aberta"
        EM_ANDAMENTO = "em_andamento", "Em andamento"
        AGUARDANDO_PECA = "aguardando_peca", "Aguardando peça"
        CONCLUIDA = "concluida", "Concluída"
        ENTREGUE = "entregue", "Entregue"
        CANCELADA = "cancelada", "Cancelada"

    numero = models.PositiveIntegerField(unique=True, editable=False)

    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT, related_name="ordens_servico")
    veiculo = models.ForeignKey(Veiculo, on_delete=models.PROTECT, related_name="ordens_servico")

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ABERTA)
    mecanico_responsavel = models.CharField(max_length=100)

    data_abertura = models.DateField()
    data_previsao = models.DateField()

    observacoes = models.TextField(blank=True, null=True)

    data_cadastro = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ordem_servico"
        verbose_name = "Ordem de Serviço"
        verbose_name_plural = "Ordens de Serviço"
        ordering = ["-numero"]

    def clean(self):
        """O veículo precisa ser do mesmo cliente da OS — não dá pra abrir OS do carro de outra pessoa."""
        if self.cliente_id and self.veiculo_id and self.veiculo.cliente_id != self.cliente_id:
            raise ValidationError({"veiculo": "Este veículo não pertence ao cliente selecionado."})

    def save(self, *args, **kwargs):
        if self.numero is None:
            ultimo = OrdemServico.objects.aggregate(models.Max("numero"))["numero__max"] or 999
            self.numero = ultimo + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"OS #{self.numero}"


class ItemOS(models.Model):
    """Linha de serviço ou peça dentro de uma Ordem de Serviço."""

    class Tipo(models.TextChoices):
        SERVICO = "servico", "Serviço"
        PECA = "peca", "Peça"

    ordem_servico = models.ForeignKey(OrdemServico, on_delete=models.CASCADE, related_name="itens")
    tipo = models.CharField(max_length=10, choices=Tipo.choices)
    descricao = models.CharField(max_length=200)
    quantidade = models.PositiveIntegerField(default=1)
    valor_unitario = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    class Meta:
        db_table = "item_os"
        verbose_name = "Item de OS"
        verbose_name_plural = "Itens de OS"

    def __str__(self):
        return f"{self.descricao} (OS #{self.ordem_servico.numero})"


class Lancamento(models.Model):
    """
    Lançamento financeiro (conta a pagar ou a receber) da oficina.

    DECISÃO: `ordem_servico` usa SET_NULL — o lançamento financeiro é o
    registro contábil e deve sobreviver mesmo que a OS de origem suma.
    """

    class Tipo(models.TextChoices):
        RECEBER = "receber", "A receber"
        PAGAR = "pagar", "A pagar"

    class Status(models.TextChoices):
        PENDENTE = "pendente", "Pendente"
        PAGO = "pago", "Pago"
        ATRASADO = "atrasado", "Atrasado"

    tipo = models.CharField(max_length=10, choices=Tipo.choices)
    descricao = models.CharField(max_length=200)
    categoria = models.CharField(max_length=80, blank=True, null=True)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    vencimento = models.DateField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDENTE)

    ordem_servico = models.ForeignKey(
        OrdemServico,
        on_delete=models.SET_NULL,
        related_name="lancamentos",
        blank=True,
        null=True,
    )

    data_cadastro = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "lancamento"
        verbose_name = "Lançamento"
        verbose_name_plural = "Lançamentos"
        ordering = ["vencimento"]

    def __str__(self):
        return f"{self.descricao} ({self.get_status_display()})"
