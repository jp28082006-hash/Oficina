from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from .models import Cliente
from .serializers import ClienteSerializer


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
        if incluir_inativos.lower() != "true":
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
