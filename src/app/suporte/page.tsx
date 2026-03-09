import Link from 'next/link'
import { Mail, MessageCircle, HelpCircle } from 'lucide-react'

export const metadata = {
  title: 'Suporte - AdInsight AI',
  description: 'Entre em contato com o suporte do AdInsight AI.',
}

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'suporte@adinsight.ai'

export default function SuportePage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-[var(--accent)] hover:underline mb-8"
        >
          ← Voltar
        </Link>
        <h1 className="text-3xl font-bold mb-2">Suporte</h1>
        <p className="text-[var(--muted)] mb-8">
          Estamos aqui para ajudar. Escolha como prefere entrar em contato.
        </p>

        <div className="space-y-6">
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-start gap-4 p-6 rounded-xl bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--accent)]/30 transition-colors block"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-1">Email</h2>
              <p className="text-sm text-[var(--muted)] mb-2">
                Envie sua dúvida ou problema. Respondemos em até 24h úteis.
              </p>
              <span className="text-[var(--accent)] font-medium">{SUPPORT_EMAIL}</span>
            </div>
          </a>

          <div className="flex items-start gap-4 p-6 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-1">Chat ao vivo</h2>
              <p className="text-sm text-[var(--muted)]">
                Se o chat estiver habilitado (canto inferior direito), clique para falar
                diretamente com nossa equipe.
              </p>
            </div>
          </div>

          <Link
            href="/docs"
            className="flex items-start gap-4 p-6 rounded-xl bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--accent)]/30 transition-colors block"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
              <HelpCircle className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="font-semibold text-lg mb-1">Documentação</h2>
              <p className="text-sm text-[var(--muted)]">
                Consulte o guia de uso para dúvidas frequentes sobre conectar contas,
                métricas e relatórios.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
