import * as Network from 'expo-network'
import { supabase } from './supabase'

const NETWORK_CHECK_TIMEOUT_MS = 1800
const SLOW_NETWORK_THRESHOLD_MS = 600

export type NetworkQuality = 'online' | 'slow' | 'offline'

export async function checkNetworkQuality(): Promise<{ quality: NetworkQuality; latencyMs: number | null }> {
  const state = await Network.getNetworkStateAsync()
  if (state.type === Network.NetworkStateType.NONE || state.isInternetReachable === false) {
    return { quality: 'offline', latencyMs: null }
  }

  let timeout: ReturnType<typeof setTimeout> | undefined
  const startedAt = Date.now()

  try {
    const probe = supabase.from('exercises').select('id').limit(1)
    await Promise.race([
      probe,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error('network-timeout')), NETWORK_CHECK_TIMEOUT_MS)
      }),
    ])
    const latencyMs = Date.now() - startedAt
    return {
      quality: latencyMs >= SLOW_NETWORK_THRESHOLD_MS ? 'slow' : 'online',
      latencyMs,
    }
  } catch {
    return { quality: 'offline', latencyMs: null }
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}
