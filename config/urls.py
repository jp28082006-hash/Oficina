"""
URL configuration for Oficina project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from backend.views import ClienteViewSet, FornecedorViewSet

router = DefaultRouter()
router.register(r'clientes', ClienteViewSet)
router.register(r'fornecedores', FornecedorViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
