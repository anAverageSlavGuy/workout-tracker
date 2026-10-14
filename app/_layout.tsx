import { useEffect, useRef } from 'react'
import { Alert, Platform } from 'react-native'
import * as Network from 'expo-network'

// Suppress victory-native DOM prop warnings on web (known issue with RN props passed to DOM)
if (Platform.OS === 'web' && typeof console !== 'undefined') {
  const _error = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    const msg = args
      .filter((arg): arg is string => typeof arg === 'string')
      .join(' ')
      .toLowerCase()
    if (
      msg.includes('accessibilityhint') ||
      msg.includes('accessibilitylabel') ||
      msg.includes('accessibilityrole')
    ) return
    _error(...args)
  }
}
import { Stack, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '../lib/auth'
import { StatusBar } from 'expo-status-bar'
import { colors } from '../constants/colors'
import { checkNetworkQuality } from '../lib/networkStatus'
import { setAutomaticOfflineMode } from '../lib/offlineSession'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function RootLayoutNav() {
  const { session, loading } = useAuth()
  const router = useRouter()
  const segments = useSegments()
  const qc = useQueryClient()
  const previousUserId = useRef<string | null>(null)
  const checkedNetworkForUser = useRef<string | null>(null)
  const networkState = Network.useNetworkState()

  useEffect(() => {
    if (loading || !session || checkedNetworkForUser.current === session.user.id) return
    if (networkState.isConnected === undefined && networkState.isInternetReachable === undefined) return

    checkedNetworkForUser.current = session.user.id
    void checkNetworkQuality().then(({ quality, latencyMs }) => {
      const needsOfflineMode = quality !== 'online'
      void setAutomaticOfflineMode(needsOfflineMode)

      if (needsOfflineMode) {
        Alert.alert(
          'MODALITÀ OFFLINE ATTIVATA',
          quality === 'slow'
            ? `La connessione è lenta (${latencyMs ?? 1800} ms). Le modifiche all’allenamento verranno salvate sul dispositivo e sincronizzate quando possibile.`
            : 'La connessione non è disponibile. Le modifiche all’allenamento verranno salvate sul dispositivo e sincronizzate quando possibile.',
          [{ text: 'OK' }],
        )
      }
    })
  }, [loading, networkState.isConnected, networkState.isInternetReachable, session])

  useEffect(() => {
    if (loading) return
    const inAuth = segments[0] === '(auth)'
    const inSessionDetail = segments[0] === 'session'
    const currentUserId = session?.user.id ?? null
    const userChanged = Boolean(previousUserId.current && currentUserId && previousUserId.current !== currentUserId)
    const staleSessionDetail = Boolean(inSessionDetail && currentUserId && previousUserId.current !== currentUserId)

    if (!currentUserId) {
      previousUserId.current = null
      qc.clear()
      if (!inAuth) router.replace('/(auth)/login')
      return
    }

    if (userChanged || staleSessionDetail) {
      qc.clear()
      router.replace('/(tabs)')
    } else if (inAuth) {
      router.replace('/(tabs)')
    }

    previousUserId.current = currentUserId
  }, [session, loading, segments, qc, router])

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="session/[id]" options={{ headerShown: false }} />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="light" />
        <RootLayoutNav />
      </AuthProvider>
    </QueryClientProvider>
  )
}
