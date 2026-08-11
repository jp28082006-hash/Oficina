from rest_framework import serializers
from .models import Cliente, Fornecedor
from .validadores import documento_e_valido


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = "__all__"
        read_only_fields = ["id", "data_cadastro", "data_atualizacao"]

    def validate(self, attrs):
        """
        Validação cruzada tipo_pessoa <-> cpf_cnpj, incluindo dígito
        verificador real (não só tamanho). Fica no `validate` geral (em vez
        de `validate_cpf_cnpj` isolado) porque a regra depende de outro
        campo (`tipo_pessoa`), e a ordem de validação de campo a campo do
        DRF não garante que `tipo_pessoa` já esteja disponível antes.
        """
        tipo = attrs.get("tipo_pessoa", getattr(self.instance, "tipo_pessoa", None))
        cpf_cnpj = attrs.get("cpf_cnpj", getattr(self.instance, "cpf_cnpj", ""))
        digitos = "".join(filter(str.isdigit, cpf_cnpj or ""))

        valido, erro = documento_e_valido(tipo, digitos)
        if not valido:
            raise serializers.ValidationError({"cpf_cnpj": erro})

        attrs["cpf_cnpj"] = digitos
        return attrs


class FornecedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fornecedor
        fields = "__all__"
        read_only_fields = ["id", "data_cadastro", "data_atualizacao"]

    def validate(self, attrs):
        """Mesma lógica de ClienteSerializer.validate — ver comentário lá."""
        tipo = attrs.get("tipo_pessoa", getattr(self.instance, "tipo_pessoa", None))
        cpf_cnpj = attrs.get("cpf_cnpj", getattr(self.instance, "cpf_cnpj", ""))
        digitos = "".join(filter(str.isdigit, cpf_cnpj or ""))

        valido, erro = documento_e_valido(tipo, digitos)
        if not valido:
            raise serializers.ValidationError({"cpf_cnpj": erro})

        attrs["cpf_cnpj"] = digitos
        return attrs
