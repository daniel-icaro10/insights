# Configuração do Supabase

## 1. Criar projeto

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
2. Crie um novo projeto (ou use um existente)
3. Aguarde a provisionagem do banco

## 2. Obter chaves da API

1. No painel do Supabase, vá em **Settings** → **API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (nunca exponha no cliente)

## 3. Variáveis de ambiente

1. Copie `.env.example` para `.env.local`
2. Preencha as variáveis do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 4. Aplicar migrations

**Projeto novo (sem banco configurado):**

1. No Supabase Dashboard → **SQL Editor**
2. Cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
3. Execute (Run)

**Já aplicou 001 antigo antes:**  
Execute também `supabase/migrations/002_alterations.sql` para novas tabelas e campos.

**Via Supabase CLI:**

```bash
npm install -g supabase
supabase login
supabase link --project-ref seu-project-ref
supabase db push
```

## 5. Configurar Auth

1. **Settings** → **Authentication** → **URL Configuration**
2. **Site URL:** `http://localhost:3000` (dev) ou sua URL de produção
3. **Redirect URLs:** adicione:
   - `http://localhost:3000/**`
   - `https://seudominio.com/**` (produção)

## 6. Verificar

Após configurar, reinicie o servidor (`npm run dev`) e teste login/registro.
