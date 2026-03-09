import Link from 'next/link'

export const metadata = {
  title: 'Termos de Uso - AdInsight AI',
  description: 'Termos de uso do serviço AdInsight AI.',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-[var(--accent)] hover:underline mb-8"
        >
          ← Voltar
        </Link>
        <h1 className="text-3xl font-bold mb-8">Termos de Uso</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-[var(--muted)]">
          <p className="text-[var(--foreground)]">Última atualização: Março de 2025</p>

          <section>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8 mb-4">1. Aceitação dos termos</h2>
            <p>
              Ao utilizar o AdInsight AI, você concorda com estes termos. Se não concordar,
              não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8 mb-4">2. Descrição do serviço</h2>
            <p>
              O AdInsight AI é uma plataforma de analytics para campanhas no Facebook Ads,
              com métricas, insights de IA, alertas e relatórios. O serviço depende de
              integrações com Meta, OpenAI e outros provedores.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8 mb-4">3. Uso aceitável</h2>
            <p>
              Você concorda em usar o serviço de forma legal e ética. É proibido: abusar das
              APIs, compartilhar credenciais, violar políticas da Meta ou OpenAI, ou utilizar
              o serviço para fins ilícitos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8 mb-4">4. Planos e pagamento</h2>
            <p>
              Os planos e preços estão descritos no site. O pagamento é processado pelo
              Stripe. A assinatura é recorrente até cancelamento. Reembolsos seguem nossa
              política e a do Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8 mb-4">5. Limitação de responsabilidade</h2>
            <p>
              O serviço é fornecido &quot;como está&quot;. Não nos responsabilizamos por decisões
              tomadas com base nos insights, falhas de terceiros (Meta, OpenAI) ou
              interrupções temporárias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8 mb-4">6. Alterações</h2>
            <p>
              Podemos alterar estes termos. Alterações significativas serão comunicadas por
              email ou na aplicação. O uso continuado após alterações constitui aceitação.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
