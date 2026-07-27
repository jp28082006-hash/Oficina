from django.contrib import admin
from .models import Cliente


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ("nome_razao_social", "tipo_pessoa", "cpf_cnpj", "telefone_principal", "ativo")
    list_filter = ("tipo_pessoa", "ativo", "uf")
    search_fields = ("nome_razao_social", "cpf_cnpj", "email")
