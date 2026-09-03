from rest_framework import serializers
from .models import Cliente, Fornecedor, Veiculo, Produto, OrdemServico, ItemOS, Lancamento
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


class VeiculoSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.CharField(source="cliente.nome_razao_social", read_only=True)

    class Meta:
        model = Veiculo
        fields = "__all__"
        read_only_fields = ["id", "data_cadastro", "data_atualizacao"]

    def validate_placa(self, value):
        return value.upper().replace("-", "").replace(" ", "")


class ProdutoSerializer(serializers.ModelSerializer):
    fornecedor_nome = serializers.CharField(source="fornecedor.nome_razao_social", read_only=True, default=None)

    class Meta:
        model = Produto
        fields = "__all__"
        read_only_fields = ["id", "data_cadastro", "data_atualizacao"]


class ItemOSSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemOS
        fields = ["id", "tipo", "descricao", "quantidade", "valor_unitario"]
        read_only_fields = ["id"]


class OrdemServicoSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.CharField(source="cliente.nome_razao_social", read_only=True)
    veiculo_descricao = serializers.SerializerMethodField()
    itens = ItemOSSerializer(many=True)

    class Meta:
        model = OrdemServico
        fields = "__all__"
        read_only_fields = ["id", "numero", "data_cadastro", "data_atualizacao"]

    def get_veiculo_descricao(self, obj):
        return f"{obj.veiculo.modelo} · {obj.veiculo.placa}"

    def validate(self, attrs):
        """Espelha OrdemServico.clean(): o veículo tem que ser do cliente da OS."""
        cliente = attrs.get("cliente", getattr(self.instance, "cliente", None))
        veiculo = attrs.get("veiculo", getattr(self.instance, "veiculo", None))
        if cliente and veiculo and veiculo.cliente_id != cliente.id:
            raise serializers.ValidationError({"veiculo": "Este veículo não pertence ao cliente selecionado."})
        return attrs

    def create(self, validated_data):
        itens_data = validated_data.pop("itens")
        ordem = OrdemServico.objects.create(**validated_data)
        for item in itens_data:
            ItemOS.objects.create(ordem_servico=ordem, **item)
        return ordem

    def update(self, instance, validated_data):
        """
        Substitui a lista de itens inteira a cada update — mais simples e
        seguro do que tentar casar item a item por id, e a UI sempre manda
        a lista completa (não faz PATCH parcial de um item isolado).
        """
        itens_data = validated_data.pop("itens", None)
        for campo, valor in validated_data.items():
            setattr(instance, campo, valor)
        instance.save()

        if itens_data is not None:
            instance.itens.all().delete()
            for item in itens_data:
                ItemOS.objects.create(ordem_servico=instance, **item)

        return instance


class LancamentoSerializer(serializers.ModelSerializer):
    os_numero = serializers.IntegerField(source="ordem_servico.numero", read_only=True, default=None)

    class Meta:
        model = Lancamento
        fields = "__all__"
        read_only_fields = ["id", "data_cadastro", "data_atualizacao"]


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
