/** Mapeia códigos/mensagens de erro para mensagens amigáveis em português */
export function getErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error)
  const lower = msg.toLowerCase()

  // Meta/Facebook API
  if (lower.includes('invalid oauth') || lower.includes('token') || lower.includes('expired')) {
    return 'Sua conexão com o Facebook expirou. Reconecte sua conta em Contas de Anúncio.'
  }
  if (lower.includes('permission') || lower.includes('ads_read') || lower.includes('access denied')) {
    return 'Permissões insuficientes. Verifique se concedeu acesso às páginas de anúncios.'
  }
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'Muitas requisições. Aguarde alguns minutos e tente novamente.'
  }
  if (lower.includes('meta api') || lower.includes('graph.facebook')) {
    return 'Erro na API do Facebook. Tente novamente em alguns instantes.'
  }

  // IA (Groq / OpenAI)
  if (lower.includes('not configured') || lower.includes('groq api key')) {
    return 'IA não configurada. Adicione GROQ_API_KEY no .env.local. Obtenha em console.groq.com'
  }
  if (lower.includes('insufficient_quota') || lower.includes('quota') || lower.includes('exceeded') || lower.includes('rate limit')) {
    return 'Limite de uso da IA atingido. Aguarde alguns minutos e tente novamente.'
  }
  if (lower.includes('invalid') && (lower.includes('api key') || lower.includes('key'))) {
    return 'Chave da IA inválida. Verifique GROQ_API_KEY em console.groq.com'
  }
  if (lower.includes('openai') || lower.includes('api key') || lower.includes('groq')) {
    return 'Erro na IA. Verifique a chave e tente novamente.'
  }

  // Stripe
  if (lower.includes('stripe') || lower.includes('invalid api key')) {
    return 'Pagamentos temporariamente indisponíveis. Tente mais tarde.'
  }

  // Redis/geral
  if (lower.includes('redis') || lower.includes('upstash')) {
    return 'Cache temporariamente indisponível. Os dados continuam funcionando.'
  }

  // Limites / 429
  if (lower.includes('429') || lower.includes('too many requests')) {
    return 'Muitas requisições. Aguarde um momento e tente novamente.'
  }

  // Fallback
  return msg || 'Ocorreu um erro. Tente novamente.'
}
