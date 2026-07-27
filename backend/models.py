from django.db import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from validate_docbr import CPF, CNPJ


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
        digitos = self.cpf_cnpj or ""

        if self.tipo_pessoa == self.TipoPessoa.FISICA:
            if len(digitos) != 11:
                raise ValidationError(
                    {"cpf_cnpj": "CPF deve conter exatamente 11 dígitos."}
                )
            if not CPF().validate(digitos):
                raise ValidationError(
                    {"cpf_cnpj": "CPF inválido (dígito verificador não confere)."}
                )

        elif self.tipo_pessoa == self.TipoPessoa.JURIDICA:
            if len(digitos) != 14:
                raise ValidationError(
                    {"cpf_cnpj": "CNPJ deve conter exatamente 14 dígitos."}
                )
            if not CNPJ().validate(digitos):
                raise ValidationError(
                    {"cpf_cnpj": "CNPJ inválido (dígito verificador não confere)."}
                )

    def __str__(self):
        return f"{self.nome_razao_social} ({self.cpf_cnpj})"
