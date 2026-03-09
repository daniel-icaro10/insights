# AdInsight AI - Guia de Configuração

## Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

### Obrigatórias

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (para webhooks) |
| `NEXT_PUBLIC_APP_URL` | URL da aplicação (ex: https://seu-dominio.vercel.app) |

### Meta Marketing API (Facebook)

| Variável | Descrição |
|----------|-----------|
| `META_APP_ID` | App ID do app Meta (Configurações > Básico) |
| `META_APP_SECRET` | App Secret do app Meta (Configurações > Básico) |

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie um app ou use um existente
3. Adicione o produto **Facebook Login** e **Marketing API**
4. Em **Configurações > Básico**: copie App ID e App Secret
5. Em **Facebook Login > Configurações**:
   - URLs de redirecionamento OAuth: `https://seu-dominio.com/api/facebook/callback`
   - Para localhost: `http://localhost:3000/api/facebook/callback`
6. Permissões necessárias: `ads_read`, `ads_management`, `business_management`, `public_profile`
7. Em **App Review**, solicite aprovação para uso em produção

### IA (Groq – gratuito)

| Variável | Descrição |
|----------|-----------|
| `GROQ_API_KEY` | API Key do Groq (console.groq.com → API Keys) |

1. Crie uma conta em [console.groq.com](https://console.groq.com)
2. Gere uma API key em **API Keys**
3. O modelo usado é `llama-3.1-8b-instant` (gratuito e rápido)

### Stripe

1. Crie uma conta em [stripe.com](https://stripe.com)
2. Crie 3 produtos com preços recorrentes (Starter $29, Pro $79, Agency $199)
3. Copie os Price IDs (`price_...`) e configure as variáveis:

| Variável | Descrição |
|----------|-----------|
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe (Dashboard → API Keys) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret do webhook (após criar o endpoint) |
| `STRIPE_STARTER_PRICE_ID` | ID do preço do plano Starter (ex: price_xxx) |
| `STRIPE_PRO_PRICE_ID` | ID do preço do plano Pro (ex: price_xxx) |
| `STRIPE_AGENCY_PRICE_ID` | ID do preço do plano Agency (ex: price_xxx) |

4. Configure o webhook em **Developers > Webhooks**:
   - URL: `https://seu-dominio.com/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
5. Use o Stripe CLI para testes locais: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
6. **Importante**: Use a chave real do Stripe (sk_test_xxx ou sk_live_xxx). NÃO use placeholders como `sk_test_...`.

### Redis (Upstash)

| Variável | Descrição |
|----------|-----------|
| `UPSTASH_REDIS_REST_URL` | URL REST do Redis (Upstash Dashboard) |
| `UPSTASH_REDIS_REST_TOKEN` | Token da API REST do Redis |

1. Crie um banco em [upstash.com](https://upstash.com)
2. Copie URL e Token da REST API
3. Opcional: sem Redis, o cache não funciona mas a aplicação funciona normalmente
4. **Importante**: NÃO use placeholders como `https://...` ou `...` no token. Deixe as variáveis vazias ou remova-as para desabilitar o cache.

---

## Supabase - Configuração do Banco

1. No dashboard Supabase, vá em **SQL Editor**
2. Execute o conteúdo de `supabase/migrations/001_initial_schema.sql`
3. Execute `supabase/migrations/002_alterations.sql` (se aplicável)
4. Execute `supabase/migrations/003_metric_snapshots.sql` (para alertas funcionarem)
5. Em **Authentication > URL Configuration**:
   - Site URL: `https://seu-dominio.com`
   - Redirect URLs: adicione `https://seu-dominio.com/api/auth/callback`, `http://localhost:3000/api/auth/callback`

---

### Monitoramento (Sentry)

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SENTRY_DSN` | DSN do projeto (sentry.io → Settings → Client Keys) |
| `SENTRY_ORG` | Slug da organização |
| `SENTRY_PROJECT` | Slug do projeto |
| `SENTRY_AUTH_TOKEN` | Token para upload de source maps (opcional, para CI) |

1. Crie um projeto em [sentry.io](https://sentry.io)
2. Configure as variáveis. Sem DSN, o Sentry não é carregado.

### Analytics (PostHog)

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_POSTHOG_KEY` | Project API Key do PostHog |
| `NEXT_PUBLIC_POSTHOG_HOST` | https://us.i.posthog.com (padrão) |

1. Crie uma conta em [posthog.com](https://posthog.com)
2. Crie um projeto e copie o Project API Key

### Suporte (Crisp)

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_CRISP_WEBSITE_ID` | Website ID do Crisp |

1. Crie uma conta em [crisp.chat](https://crisp.chat)
2. Adicione seu site e copie o Website ID

### Suporte (Email)

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Email exibido na página de suporte |

---

## Deploy no Vercel

1. Conecte o repositório ao Vercel
2. Configure todas as variáveis de ambiente
3. Para o webhook do Stripe, use a URL de produção: `https://seu-projeto.vercel.app/api/stripe/webhook`
4. Build Command: `npm run build`
5. Output Directory: `.next`

### Observações Vercel

- O Supabase precisa ter a URL do Vercel nas redirect URLs
- O Facebook precisa ter a URL de produção no redirect OAuth
- O Redis Upstash funciona em serverless

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── (dashboard)/     # Rotas protegidas com layout
│   │   ├── dashboard/
│   │   ├── ad-accounts/
│   │   ├── campaigns/
│   │   ├── reports/
│   │   ├── ai-insights/
│   │   └── settings/
│   ├── api/             # API Routes
│   │   ├── auth/
│   │   ├── facebook/
│   │   ├── metrics/
│   │   ├── ai/
│   │   ├── alerts/
│   │   ├── reports/
│   │   └── stripe/
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── components/
├── lib/
├── store/
└── types/
```

---

## Executar localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:3000
