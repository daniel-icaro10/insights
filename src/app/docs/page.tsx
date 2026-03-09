import Link from 'next/link'
import {
  BookOpen,
  Link2,
  BarChart3,
  Sparkles,
  Bell,
  FileText,
  ChevronDown,
} from 'lucide-react'

export const metadata = {
  title: 'Documentação - AdInsight AI',
  description: 'Guia de uso do AdInsight AI.',
}

const SECTIONS = [
  {
    id: 'comecar',
    title: 'Como começar',
    icon: Link2,
    content: [
      'Crie uma conta em AdInsight AI',
      'Conecte sua conta do Facebook Ads em "Contas de Anúncio"',
      'Autorize o acesso às páginas de anúncios quando solicitado',
      'Pronto! Suas métricas aparecem no Dashboard',
    ],
  },
  {
    id: 'conectar',
    title: 'Conectar conta Facebook',
    icon: Link2,
    content: [
      'Acesse o menu "Contas de Anúncio"',
      'Clique em "Conectar Facebook"',
      'Faça login no Facebook se necessário',
      'Selecione as páginas de anúncios que deseja conectar',
      'Conceda as permissões solicitadas (ads_read, ads_management)',
      'Você será redirecionado de volta ao AdInsight',
    ],
  },
  {
    id: 'metricas',
    title: 'Entendendo as métricas',
    icon: BarChart3,
    content: [
      'Gasto: valor total investido em anúncios',
      'Receita: valor de vendas/conversões rastreadas',
      'ROAS: retorno sobre investimento (Receita ÷ Gasto)',
      'CTR: taxa de cliques (Cliques ÷ Impressões × 100)',
      'CPC: custo por clique (Gasto ÷ Cliques)',
      'Conversões: ações completadas (compras, leads, etc.)',
    ],
  },
  {
    id: 'insights',
    title: 'Insights com IA',
    icon: Sparkles,
    content: [
      'Acesse "Insights IA" no menu',
      'Selecione a conta e o período desejado',
      'Clique em "Gerar Insights" ou "Analisar com IA"',
      'A IA analisa suas campanhas e sugere otimizações',
      'Limite diário de análises conforme seu plano',
    ],
  },
  {
    id: 'alertas',
    title: 'Alertas automáticos',
    icon: Bell,
    content: [
      'Os alertas são gerados automaticamente ao acessar o Dashboard',
      'Detectamos: quedas de CTR, CPC alto, ROAS, picos de gasto',
      'Compare o snapshot atual com o anterior',
      'Acesse "Alertas" para ver o histórico e marcar como lidos',
    ],
  },
  {
    id: 'relatorios',
    title: 'Relatórios',
    icon: FileText,
    content: [
      'Acesse "Relatórios" no menu',
      'Escolha o período (7d, 30d ou personalizado)',
      'Selecione o formato: PDF ou CSV',
      'Clique em "Gerar Relatório" para baixar',
      'Limite mensal conforme seu plano',
    ],
  },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-[var(--accent)] hover:underline mb-8"
        >
          ← Voltar
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-10 h-10 text-[var(--accent)]" />
          <div>
            <h1 className="text-3xl font-bold">Documentação</h1>
            <p className="text-[var(--muted)]">Guia de uso do AdInsight AI</p>
          </div>
        </div>

        <div className="space-y-8">
          {SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <section
                key={section.id}
                id={section.id}
                className="bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-6 shadow-sm"
              >
                <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                  <Icon className="w-5 h-5 text-[var(--accent)]" />
                  {section.title}
                </h2>
                <ol className="space-y-2 list-decimal list-inside text-[var(--muted)]">
                  {section.content.map((item, i) => (
                    <li key={i} className="pl-2">
                      {item}
                    </li>
                  ))}
                </ol>
              </section>
            )
          })}
        </div>

        <div className="mt-12 p-6 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
          <p className="text-sm text-[var(--foreground)]">
            <strong>Precisa de ajuda?</strong> Entre em contato pelo chat no canto inferior
            direito ou acesse a página de Suporte.
          </p>
          <Link
            href="/suporte"
            className="inline-flex items-center gap-2 mt-3 text-[var(--accent)] hover:underline font-medium"
          >
            Ir para Suporte
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </Link>
        </div>
      </div>
    </div>
  )
}
