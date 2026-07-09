import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import { colors } from '../../constants/colors'

export default function ProfileScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleSignOut() {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Sei sicuro di voler uscire?')
      : await new Promise(resolve => {
          Alert.alert('Esci', 'Vuoi uscire?', [
            { text: 'Annulla', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Esci', style: 'destructive', onPress: () => resolve(true) },
          ])
        })

    if (confirmed) {
      setIsLoggingOut(true)
      await supabase.auth.signOut()
      router.replace('/(auth)/login')
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.ornamentRow}>
          <View style={styles.line} /><Text style={styles.ornamentChar}>✦</Text><View style={styles.line} />
        </View>
        <Text style={styles.title}>PROFILO</Text>

        <View style={styles.card}>
          <View style={styles.cardAccent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>EMAIL</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.signOutBtn, isLoggingOut && styles.signOutBtnDisabled]} onPress={handleSignOut} disabled={isLoggingOut}>
          {isLoggingOut
            ? <ActivityIndicator color={colors.accent} />
            : <Text style={styles.signOutText}>ESCI</Text>
          }
        </TouchableOpacity>

        <View style={{ flex: 1 }} />
        <View style={styles.ornamentBottom}>
          <View style={styles.line} /><Text style={styles.ornamentChar}>✦</Text><View style={styles.line} />
        </View>
        <Text style={styles.version}>WORKOUT TRACKER v1.0.0</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: 24, gap: 24 },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ornamentBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  ornamentChar: { color: colors.accent, fontSize: 12 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 8, marginBottom: 8 },
  card: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 16, gap: 16 },
  cardAccent: { width: 2, backgroundColor: colors.accent },
  label: { fontSize: 9, color: colors.textMuted, letterSpacing: 3, marginBottom: 8 },
  value: { fontSize: 15, color: colors.text },
  signOutBtn: { borderWidth: 1, borderColor: colors.accent, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
  signOutBtnDisabled: { opacity: 0.5 },
  signOutText: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 4 },
  version: { textAlign: 'center', color: colors.textDim, fontSize: 9, letterSpacing: 3 },
})
