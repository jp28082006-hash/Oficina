from rest_framework.routers import DefaultRouter
from .views import ClienteViewSet, FornecedorViewSet

router = DefaultRouter()
router.register(r"clientes", ClienteViewSet, basename="cliente")
router.register(r"fornecedores", FornecedorViewSet, basename="fornecedor")

urlpatterns = router.urls
