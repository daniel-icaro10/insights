import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade - AdInsight AI',
  description: 'Política de privacidade e uso de dados do AdInsight AI.',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-[var(--accent)] hover:underline mb-8"
        >
          ← Voltar
        </Link>
        <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-[var(--muted)]">
          <p className="text-[var(--foreground)]">Última atualização: Março de 2025</p>

          <section>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8 mb-4">1. Dados que coletamos</h2>
            <p>
              Coletamos informações necessárias para o funcionamento do serviço: email, nome,
              dados de conexão com Facebook Ads (via OAuth oficial da Meta), e métricas de
              campanhas que você escolhe analisar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8 mb-4">2. Como usamos os dados</h2>
            <p>
              Utilizamos seus dados para fornecer métricas, insights com IA, alertas e
              relatórios. Não vendemos nem compartilhamos seus dados com terceiros para
              marketing. Podemos usar serviços como Supabase, OpenAI e Meta API para
              processamento, sob suas respectivas políticas de privacidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8 mb-4">3. Cookies e armazenamento</h2>
            <p>
              Utilizamos cookies e armazenamento local para manter sua sessão e preferências
              (como tema e filtros). Esses dados permanecem no seu dispositivo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8 mb-4">4. Seus direitos (LGPD)</h2>
            <p>
              Você pode solicitar acesso, correção, exclusão ou portabilidade dos seus dados.
              Entre em contato pelo email de suporte. A exclusão da conta remove seus dados
              em até 30 dias.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mt-8 mb-4">5. Contato</h2>
            <p>
              Dúvidas sobre esta política: entre em contato pelo email de suporte indicado
              na aplicação.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
