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

## Deploy (hospedagem gratuita)

Combinação recomendada: **Neon** (Postgres) + **Render** (backend) + **Vercel** (front).
O backend já está preparado pra isso (lê tudo de variáveis de ambiente — veja
`.env.example` na raiz). Free tier: o backend "dorme" sem uso e a primeira
requisição depois disso demora ~30-50s pra acordar — normal, não é bug.

**1. Banco de dados** — crie um projeto grátis em [neon.tech](https://neon.tech)
(ou [supabase.com](https://supabase.com)) e copie a *connection string*
(`postgresql://usuario:senha@host/banco`).

**2. Backend em [render.com](https://render.com)** — "New" → "Blueprint",
conecte este repositório (o `render.yaml` na raiz já descreve o serviço).
Depois de criado, no painel do serviço, preencha as variáveis marcadas
como pendentes:
- `DATABASE_URL`: a connection string do passo 1
- `ALLOWED_HOSTS`: o hostname que o Render te deu, ex. `oficina-backend.onrender.com`
- `CSRF_TRUSTED_ORIGINS`: `https://` + o mesmo hostname acima
- `CORS_ALLOWED_ORIGINS`: deixe em branco por enquanto (volta no passo 4)

Depois do primeiro deploy, crie um usuário de admin pela aba "Shell" do
Render: `python manage.py createsuperuser`.

**3. Frontend em [vercel.com](https://vercel.com)** — "Add New" → "Project",
importe este repositório, em "Root Directory" selecione
`Modern ERP for Auto Workshop`. Em "Environment Variables", adicione
`VITE_API_URL` = `https://<seu-backend>.onrender.com/api`. Deploy.

**4. Feche o CORS** — com a URL que o Vercel gerou, volte no Render e
preencha `CORS_ALLOWED_ORIGINS` com ela (ex. `https://oficina-clara.vercel.app`,
sem barra no final). Salvar já dispara um novo deploy do backend.

## Módulos

Todos os módulos são 100% integrados com a API real (sem dados mock):
Clientes, Fornecedores, Veículos, Ordens de Serviço, Estoque e Financeiro.
Clientes/Fornecedores/Veículos/Estoque usam soft delete (campo `ativo` +
ação `reativar`); Ordens de Serviço e Financeiro não têm soft delete —
o ciclo de vida da OS é modelado pelo próprio `status`.
