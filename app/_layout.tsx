import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'

// Suppress victory-native DOM prop warnings on web (known issue with RN props passed to DOM)
if (Platform.OS === 'web' && typeof console !== 'undefined') {
  const _error = console.error.bind(console)
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === 'string' ? args[0] : ''
    if (msg.includes('accessibilityHint') || msg.includes('accessibilityLabel') || msg.includes('accessibilityRole')) return
    _error(...args)
  }
}
import { Stack, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '../lib/auth'
import { StatusBar } from 'expo-status-bar'
import { colors } from '../constants/colors'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

function RootLayoutNav() {
  const { session, loading } = useAuth()
  const router = useRouter()
  const segments = useSegments()
  const qc = useQueryClient()
  const previousUserId = useRef<string | null>(null)

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
