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
