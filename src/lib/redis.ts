import { Redis } from '@upstash/redis'

/** Valida se as credenciais Redis são reais (não placeholders) */
function isValidRedisConfig(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) return false
  // Rejeita placeholders como "https://..." ou "..."
  if (url.includes('...') || token.includes('...')) return false
  // Upstash URLs são https://xxx.upstash.io
  if (!url.startsWith('https://') || url.length < 25) return false
  return true
}

let _redis: Redis | null = null
try {
  _redis = isValidRedisConfig()
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
    : null
} catch {
  _redis = null
}

export const redis = _redis

const CACHE_TTL = 900 // 15 minutes in seconds

export function getCacheKey(prefix: string, adAccountId: string, dateRange: string): string {
  return `adinsight:${prefix}:${adAccountId}:${dateRange}`
}

export async function getCached<T>(key: string): Promise<T | null> {
  if (!redis) return null
  try {
    const raw = await redis.get<string>(key)
    if (typeof raw === 'string') return JSON.parse(raw) as T
    return raw as T | null
  } catch {
    return null
  }
}

export async function setCache<T>(key: string, data: T): Promise<void> {
  if (!redis) return
  try {
    await redis.setex(key, CACHE_TTL, JSON.stringify(data))
  } catch {
    // Silently fail - cache is optional
  }
}
