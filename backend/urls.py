from rest_framework.routers import DefaultRouter
from .views import (
    ClienteViewSet,
    FornecedorViewSet,
    VeiculoViewSet,
    ProdutoViewSet,
    OrdemServicoViewSet,
    LancamentoViewSet,
)

router = DefaultRouter()
router.register(r"clientes", ClienteViewSet, basename="cliente")
router.register(r"fornecedores", FornecedorViewSet, basename="fornecedor")
router.register(r"veiculos", VeiculoViewSet, basename="veiculo")
router.register(r"produtos", ProdutoViewSet, basename="produto")
router.register(r"ordens-servico", OrdemServicoViewSet, basename="ordemservico")
router.register(r"lancamentos", LancamentoViewSet, basename="lancamento")

urlpatterns = router.urls
