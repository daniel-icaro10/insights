'use client'

import Link from 'next/link'
import {
  BarChart3,
  Sparkles,
  Bell,
  FileText,
  Target,
  Shield,
  Check,
} from 'lucide-react'

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Métricas em tempo real',
    desc: 'Dashboard com gasto, ROAS, CTR, CPC e conversões. Filtros por data e conta.',
  },
  {
    icon: Sparkles,
    title: 'Insights com IA',
    desc: 'Análise automática das campanhas com recomendações práticas de otimização.',
  },
  {
    icon: Bell,
    title: 'Alertas inteligentes',
    desc: 'Notificações quando CTR cai, CPC sobe ou ROAS despenca.',
  },
  {
    icon: FileText,
    title: 'Relatórios PDF/CSV',
    desc: 'Exporte performance e campanhas para apresentações ou análise offline.',
  },
  {
    icon: Target,
    title: 'Múltiplas contas',
    desc: 'Gerencie várias contas de anúncios em um único lugar.',
  },
  {
    icon: Shield,
    title: 'Seguro e confiável',
    desc: 'Conexão oficial com Meta. Seus dados protegidos.',
  },
]

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    desc: 'Para começar',
    features: ['1 conta de anúncio', 'Dashboard completo', 'Relatórios PDF/CSV', 'Suporte por email'],
    cta: 'Começar agora',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    popular: true,
    desc: 'Para profissionais',
    features: ['5 contas', 'Insights de IA', 'Alertas automáticos', 'Suporte prioritário'],
    cta: 'Assinar Pro',
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 199,
    desc: 'Para agências',
    features: ['Contas ilimitadas', 'Tudo do Pro', 'API access', 'Gerente dedicado'],
    cta: 'Falar com vendas',
  },
]

export function LandingClient() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-white/95 backdrop-blur-md">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <Link href="/" className="text-lg font-semibold text-[var(--foreground)]">
              AdInsight AI
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                Entrar
              </Link>
              <Link href="/register" className="btn-primary btn-sm">
                Criar conta
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 sm:py-28 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--accent)]/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-[var(--accent)]/5 rounded-full blur-3xl" />
        </div>
        <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 lg:gap-20 xl:gap-24 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Analytics + IA para Facebook Ads
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--foreground)] mb-6">
                Inteligência de desempenho{' '}
                <span className="text-[var(--accent)]">para suas campanhas</span>
              </h1>
              <p className="text-lg text-[var(--muted)] max-w-xl mb-10 leading-relaxed">
                Conecte sua conta do Facebook Ads, analise métricas em tempo real e receba insights
                automáticos com IA. Tudo em um dashboard profissional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="btn-primary !px-8 !py-4 !text-base">
                  Criar conta grátis
                </Link>
                <Link href="/login" className="btn-secondary !px-8 !py-4 !text-base">
                  Já tenho conta
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex justify-center items-center mt-12 lg:mt-0">
              <div className="w-full max-w-md aspect-square rounded-3xl bg-[var(--card)] border border-[var(--card-border)] flex items-center justify-center shadow-xl">
                <BarChart3 className="w-32 h-32 text-[var(--accent)]/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 border-t border-[var(--card-border)] bg-slate-50">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-[var(--muted)] max-w-xl mx-auto">
              Ferramentas profissionais para quem leva Facebook Ads a sério.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div
                  key={f.title}
                  className="p-6 lg:p-8 rounded-xl bg-white border border-[var(--card-border)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-[var(--muted)] text-sm">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-10 border-t border-[var(--card-border)]">
        <div className="w-full max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
              Planos transparentes
            </h2>
            <p className="text-[var(--muted)] max-w-xl mx-auto">
              Escolha o plano ideal. Cancele quando quiser.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-2xl border-2 ${
                  plan.popular
                    ? 'border-[var(--accent)] bg-[var(--card)] shadow-lg'
                    : 'border-[var(--card-border)] bg-[var(--card)]'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-semibold">
                    Mais popular
                  </span>
                )}
                <h3 className="font-bold text-xl">{plan.name}</h3>
                <p className="text-sm text-[var(--muted)] mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-[var(--muted)]">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-[var(--success)] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`flex w-full justify-center items-center py-3 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] ${
                    plan.popular
                      ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'
                      : 'border-2 border-[var(--card-border)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/5'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-10 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
            Pronto para otimizar suas campanhas?
          </h2>
          <p className="text-[var(--muted)] mb-8">
            Junte-se a gestores que já usam o AdInsight AI para tomar decisões mais inteligentes.
          </p>
          <Link href="/register" className="btn-primary !px-8 !py-4 !text-base">
            Começar agora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-10 border-t border-[var(--card-border)]">
        <div className="w-full max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted)]">© AdInsight AI</p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              Entrar
            </Link>
            <Link href="/register" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              Cadastrar
            </Link>
            <Link href="/privacidade" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              Privacidade
            </Link>
            <Link href="/termos" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              Termos
            </Link>
            <Link href="/status" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              Status
            </Link>
            <Link href="/docs" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              Documentação
            </Link>
            <Link href="/suporte" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              Suporte
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
