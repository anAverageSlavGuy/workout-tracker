import { useEffect } from 'react'
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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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

  useEffect(() => {
    if (loading) return
    const inAuth = segments[0] === '(auth)'
    if (!session && !inAuth) router.replace('/(auth)/login')
    else if (session && inAuth) router.replace('/(tabs)')
  }, [session, loading, segments])

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="session/[id]" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
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
