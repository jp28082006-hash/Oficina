"""
Validadores compartilhados entre models.py e serializers.py.

Centralizado aqui para não duplicar a mesma regra de validação de
CPF/CNPJ (dígito verificador real, via validate_docbr) em dois lugares
que podem divergir com o tempo — é o mesmo problema que já resolvemos
nos triggers do banco: uma regra, um lugar só.
"""
from validate_docbr import CPF, CNPJ


def documento_e_valido(tipo_pessoa: str, documento: str) -> tuple[bool, str | None]:
    """
    Valida CPF (PF) ou CNPJ (PJ), incluindo dígito verificador real
    (não é só checagem de tamanho).

    Retorna (True, None) se válido, ou (False, "mensagem de erro") se não.
    Quem chama decide COMO reportar o erro (ValidationError do Django em
    models.py, ValidationError do DRF em serializers.py) — esta função só
    decide SE é válido.
    """
    digitos = "".join(filter(str.isdigit, documento or ""))

    if tipo_pessoa == "PF":
        if len(digitos) != 11:
            return False, "CPF deve conter exatamente 11 dígitos."
        if not CPF().validate(digitos):
            return False, "CPF inválido (dígito verificador não confere)."
    elif tipo_pessoa == "PJ":
        if len(digitos) != 14:
            return False, "CNPJ deve conter exatamente 14 dígitos."
        if not CNPJ().validate(digitos):
            return False, "CNPJ inválido (dígito verificador não confere)."
    else:
        return False, "tipo_pessoa deve ser 'PF' ou 'PJ'."

    return True, None
