from django.contrib import admin
from .models import Cliente, Fornecedor, Veiculo, Produto, OrdemServico, ItemOS, Lancamento


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ("nome_razao_social", "tipo_pessoa", "cpf_cnpj", "telefone_principal", "ativo")
    list_filter = ("tipo_pessoa", "ativo", "uf")
    search_fields = ("nome_razao_social", "cpf_cnpj", "email")


@admin.register(Fornecedor)
class FornecedorAdmin(admin.ModelAdmin):
    list_display = ("nome_razao_social", "tipo_pessoa", "cpf_cnpj", "telefone_principal", "ativo")
    list_filter = ("tipo_pessoa", "ativo", "uf")
    search_fields = ("nome_razao_social", "cpf_cnpj", "email")


@admin.register(Veiculo)
class VeiculoAdmin(admin.ModelAdmin):
    list_display = ("placa", "modelo", "marca", "cliente", "km", "ativo")
    list_filter = ("marca", "ativo")
    search_fields = ("placa", "modelo", "marca", "cliente__nome_razao_social")


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ("nome", "categoria", "quantidade", "quantidade_minima", "preco_venda", "ativo")
    list_filter = ("categoria", "ativo")
    search_fields = ("nome", "categoria")


class ItemOSInline(admin.TabularInline):
    model = ItemOS
    extra = 0


@admin.register(OrdemServico)
class OrdemServicoAdmin(admin.ModelAdmin):
    list_display = ("numero", "cliente", "veiculo", "status", "mecanico_responsavel", "data_previsao")
    list_filter = ("status",)
    search_fields = ("numero", "cliente__nome_razao_social", "veiculo__placa")
    inlines = [ItemOSInline]


@admin.register(Lancamento)
class LancamentoAdmin(admin.ModelAdmin):
    list_display = ("descricao", "tipo", "valor", "vencimento", "status")
    list_filter = ("tipo", "status")
    search_fields = ("descricao", "categoria")
