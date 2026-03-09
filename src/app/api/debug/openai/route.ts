import { NextResponse } from 'next/server'

/** Rota de diagnóstico: verifica se GROQ_API_KEY está configurada (apenas dev) */
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Apenas em desenvolvimento' }, { status: 404 })
  }

  const key = process.env.GROQ_API_KEY
  const configured = !!key && key.length > 10

  return NextResponse.json({
    configured,
    hasValue: !!key,
    length: key ? key.length : 0,
    hint: configured
      ? 'Chave Groq OK. Se ainda falha, reinicie o servidor (Ctrl+C e npm run dev).'
      : 'Adicione GROQ_API_KEY em .env.local. Obtenha em console.groq.com',
  })
}
