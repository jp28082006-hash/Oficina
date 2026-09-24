# Oficina

Sistema de gestão para oficina mecânica: cadastro de clientes, fornecedores,
veículos, ordens de serviço, estoque e financeiro.

- **Backend**: Django + Django REST Framework (`backend/`, `config/`)
- **Frontend**: React + TypeScript + Vite + Tailwind — "Oficina Clara" (`Modern ERP for Auto Workshop/`)

## Rodando o backend

```bash
cd backend
python -m venv venv && source venv/bin/activate  # se ainda não existir
pip install -r requirements.txt
cd ..
python manage.py migrate
python manage.py runserver
```

API disponível em `http://localhost:8000/api/` (admin em `/admin/`).

### Popular com dados de exemplo

```bash
python manage.py popular_dados            # adiciona por cima do que já existe
python manage.py popular_dados --reset    # apaga tudo antes de popular
```

Cria clientes (PF/PJ), fornecedores, veículos, produtos, ordens de serviço
(com itens) e lançamentos financeiros — com CPF/CNPJ válidos de verdade.

## Rodando o frontend

```bash
cd "Modern ERP for Auto Workshop"
npm install
npm run dev
```

Front disponível em `http://localhost:5173`. Por padrão aponta para a API em
`http://localhost:8000/api` (configurável via `VITE_API_URL`, veja `.env.example`).

## Módulos

Todos os módulos são 100% integrados com a API real (sem dados mock):
Clientes, Fornecedores, Veículos, Ordens de Serviço, Estoque e Financeiro.
Clientes/Fornecedores/Veículos/Estoque usam soft delete (campo `ativo` +
ação `reativar`); Ordens de Serviço e Financeiro não têm soft delete —
o ciclo de vida da OS é modelado pelo próprio `status`.
