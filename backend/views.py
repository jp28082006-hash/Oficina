from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from .models import Cliente, Fornecedor, Veiculo, Produto, OrdemServico, Lancamento
from .serializers import (
    ClienteSerializer,
    FornecedorSerializer,
    VeiculoSerializer,
    ProdutoSerializer,
    OrdemServicoSerializer,
    LancamentoSerializer,
)


class ClienteViewSet(viewsets.ModelViewSet):
    """
    CRUD de Cliente (Pessoa Física ou Jurídica).

    IMPORTANTE: o DELETE HTTP aqui é sobrescrito para NUNCA apagar o
    registro fisicamente — apenas marca `ativo=False`. Se algum dia for
    necessário hard delete de verdade, isso precisa de uma rota separada
    e explícita, com checagem de que não existe Veículo/OS/Venda vinculada.
    """

    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["tipo_pessoa", "ativo", "cidade", "uf"]
    search_fields = ["nome_razao_social", "nome_fantasia", "cpf_cnpj", "email"]
    ordering_fields = ["nome_razao_social", "data_cadastro"]

    def get_queryset(self):
        """
        Por padrão só retorna clientes ativos, a menos que
        ?incluir_inativos=true seja passado explicitamente.
        """
        qs = super().get_queryset()
        incluir_inativos = self.request.query_params.get("incluir_inativos", "false")
        if self.action == "list" and incluir_inativos.lower() != "true":
            # Fora da listagem (retrieve/update/reativar/...) o objeto tem que
            # ser sempre acessível pelo id — senão "Reativar" nunca encontra
            # o próprio registro que acabou de inativar.
            qs = qs.filter(ativo=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        """Soft delete: marca ativo=False em vez de apagar o registro."""
        instance = self.get_object()
        instance.ativo = False
        instance.save(update_fields=["ativo"])
        return Response(status=204)

    @action(detail=True, methods=["post"])
    def reativar(self, request, pk=None):
        """Reativa um cliente marcado como inativo."""
        instance = self.get_object()
        instance.ativo = True
        instance.save(update_fields=["ativo"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class FornecedorViewSet(viewsets.ModelViewSet):
    """
    CRUD de Fornecedor (Pessoa Física ou Jurídica).

    Mesmo padrão de ClienteViewSet: DELETE HTTP nunca apaga fisicamente,
    só marca `ativo=False`.
    """

    queryset = Fornecedor.objects.all()
    serializer_class = FornecedorSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["tipo_pessoa", "ativo", "cidade", "uf"]
    search_fields = ["nome_razao_social", "nome_fantasia", "cpf_cnpj", "email"]
    ordering_fields = ["nome_razao_social", "data_cadastro"]

    def get_queryset(self):
        qs = super().get_queryset()
        incluir_inativos = self.request.query_params.get("incluir_inativos", "false")
        if self.action == "list" and incluir_inativos.lower() != "true":
            # Fora da listagem (retrieve/update/reativar/...) o objeto tem que
            # ser sempre acessível pelo id — senão "Reativar" nunca encontra
            # o próprio registro que acabou de inativar.
            qs = qs.filter(ativo=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        """Soft delete: marca ativo=False em vez de apagar o registro."""
        instance = self.get_object()
        instance.ativo = False
        instance.save(update_fields=["ativo"])
        return Response(status=204)

    @action(detail=True, methods=["post"])
    def reativar(self, request, pk=None):
        """Reativa um fornecedor marcado como inativo."""
        instance = self.get_object()
        instance.ativo = True
        instance.save(update_fields=["ativo"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class VeiculoViewSet(viewsets.ModelViewSet):
    """CRUD de Veículo. Mesmo padrão de soft delete de ClienteViewSet."""

    queryset = Veiculo.objects.select_related("cliente").all()
    serializer_class = VeiculoSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["cliente", "ativo"]
    search_fields = ["placa", "marca", "modelo", "cliente__nome_razao_social"]
    ordering_fields = ["data_cadastro", "km"]

    def get_queryset(self):
        qs = super().get_queryset()
        incluir_inativos = self.request.query_params.get("incluir_inativos", "false")
        if self.action == "list" and incluir_inativos.lower() != "true":
            # Fora da listagem (retrieve/update/reativar/...) o objeto tem que
            # ser sempre acessível pelo id — senão "Reativar" nunca encontra
            # o próprio registro que acabou de inativar.
            qs = qs.filter(ativo=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.ativo = False
        instance.save(update_fields=["ativo"])
        return Response(status=204)

    @action(detail=True, methods=["post"])
    def reativar(self, request, pk=None):
        instance = self.get_object()
        instance.ativo = True
        instance.save(update_fields=["ativo"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class ProdutoViewSet(viewsets.ModelViewSet):
    """CRUD de Produto (estoque). Mesmo padrão de soft delete de ClienteViewSet."""

    queryset = Produto.objects.select_related("fornecedor").all()
    serializer_class = ProdutoSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["categoria", "fornecedor", "ativo"]
    search_fields = ["nome", "categoria"]
    ordering_fields = ["nome", "quantidade", "data_cadastro"]

    def get_queryset(self):
        qs = super().get_queryset()
        incluir_inativos = self.request.query_params.get("incluir_inativos", "false")
        if self.action == "list" and incluir_inativos.lower() != "true":
            # Fora da listagem (retrieve/update/reativar/...) o objeto tem que
            # ser sempre acessível pelo id — senão "Reativar" nunca encontra
            # o próprio registro que acabou de inativar.
            qs = qs.filter(ativo=True)
        return qs

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.ativo = False
        instance.save(update_fields=["ativo"])
        return Response(status=204)

    @action(detail=True, methods=["post"])
    def reativar(self, request, pk=None):
        instance = self.get_object()
        instance.ativo = True
        instance.save(update_fields=["ativo"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class OrdemServicoViewSet(viewsets.ModelViewSet):
    """
    CRUD de Ordem de Serviço.

    Sem soft delete aqui (ver docstring do model) — o DELETE HTTP remove
    o registro de verdade. Quem quiser "desistir" de uma OS sem apagar o
    histórico deve mudar o status para `cancelada`, não excluí-la.
    """

    queryset = OrdemServico.objects.select_related("cliente", "veiculo").prefetch_related("itens").all()
    serializer_class = OrdemServicoSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "cliente", "veiculo"]
    search_fields = ["numero", "cliente__nome_razao_social", "veiculo__placa"]
    ordering_fields = ["numero", "data_abertura", "data_previsao"]


class LancamentoViewSet(viewsets.ModelViewSet):
    """CRUD de Lançamento financeiro. Sem soft delete: é um registro contábil simples."""

    queryset = Lancamento.objects.select_related("ordem_servico").all()
    serializer_class = LancamentoSerializer

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["tipo", "status", "categoria"]
    search_fields = ["descricao", "categoria"]
    ordering_fields = ["vencimento", "valor", "data_cadastro"]
