from rest_framework import serializers
from validate_docbr import CPF, CNPJ
from .models import Cliente


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

        if tipo == "PF":
            if len(digitos) != 11:
                raise serializers.ValidationError(
                    {"cpf_cnpj": "CPF deve ter exatamente 11 dígitos."}
                )
            if not CPF().validate(digitos):
                raise serializers.ValidationError(
                    {"cpf_cnpj": "CPF inválido — dígito verificador não confere."}
                )
        elif tipo == "PJ":
            if len(digitos) != 14:
                raise serializers.ValidationError(
                    {"cpf_cnpj": "CNPJ deve ter exatamente 14 dígitos."}
                )
            if not CNPJ().validate(digitos):
                raise serializers.ValidationError(
                    {"cpf_cnpj": "CNPJ inválido — dígito verificador não confere."}
                )

        attrs["cpf_cnpj"] = digitos
        return attrs
