# AdInsight AI

Plataforma SaaS profissional para analytics e inteligência de desempenho de Facebook Ads.

## Funcionalidades

- **Autenticação**: Registro, login, logout, redefinição de senha (Supabase Auth)
- **Conexão Facebook Ads**: OAuth com Meta Marketing API, múltiplas contas
- **Dashboard**: Métricas em tempo real, gráficos interativos, filtros de data
- **Campanhas**: Tabela de performance com ordenação e busca
- **Insights de IA**: Análise automática com Groq/LLaMA (CTR, CPC, ROAS, recomendações)
- **Alertas**: CTR, CPC, ROAS, gastos
- **Relatórios**: Exportação PDF e CSV
- **Assinaturas**: Stripe (Starter, Pro, Agency)
- **Dark mode**: Suporte a tema claro/escuro

## Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS, Recharts, Zustand
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth)
- **Integrações**: Meta Marketing API, Groq (IA), Stripe
- **Cache**: Upstash Redis (opcional)

## Início rápido

```bash
npm install
cp .env.example .env.local
# Preencha as variáveis em .env.local
npm run dev
```

Acesse http://localhost:3000

## Configuração

Consulte [SETUP.md](./SETUP.md) para instruções detalhadas de:

- Variáveis de ambiente
- Meta Marketing API
- Groq (IA)
- Stripe
- Redis (Upstash)
- Deploy no Vercel

## Estrutura

```
src/
├── app/
│   ├── (dashboard)/    # Rotas protegidas
│   ├── api/            # API Routes
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── components/
├── lib/
├── store/
└── types/
```

## Licença

MIT
