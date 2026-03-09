import Link from 'next/link'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Status do Serviço - AdInsight AI',
  description: 'Status operacional do AdInsight AI.',
}

const SERVICES = [
  { id: 'api', name: 'API Principal', status: 'operational' },
  { id: 'auth', name: 'Autenticação', status: 'operational' },
  { id: 'meta', name: 'Integração Meta/Facebook', status: 'operational' },
  { id: 'openai', name: 'Insights com IA', status: 'operational' },
  { id: 'stripe', name: 'Pagamentos', status: 'operational' },
]

export default function StatusPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-[var(--accent)] hover:underline mb-8"
        >
          ← Voltar
        </Link>
        <h1 className="text-3xl font-bold mb-2">Status do Serviço</h1>
        <p className="text-[var(--muted)] mb-8">
          Todos os sistemas operacionais
        </p>

        <div className="space-y-4">
          {SERVICES.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-4 rounded-xl bg-[var(--card)] border border-[var(--card-border)]"
            >
              <span className="font-medium">{s.name}</span>
              <span
                className={`inline-flex items-center gap-2 text-sm ${
                  s.status === 'operational' ? 'text-[var(--success)]' : 'text-[var(--warning)]'
                }`}
              >
                {s.status === 'operational' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Operacional
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Incidente
                  </>
                )}
              </span>
            </div>
          ))}
        </div>

        <p className="text-sm text-[var(--muted)] mt-8">
          Em caso de problemas, entre em contato pelo suporte.
        </p>
      </div>
    </div>
  )
}
