import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import { colors } from '../../constants/colors'

export default function ProfileScreen() {
  const { user } = useAuth()

  async function handleSignOut() {
    Alert.alert('Esci', 'Vuoi uscire dall\'account?', [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Esci', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ])
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.title}>Profilo</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Esci</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Workout Tracker v1.0.0</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 4 },
  label: { fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  value: { fontSize: 16, color: colors.text, fontWeight: '500' },
  signOutBtn: {
    borderWidth: 1, borderColor: colors.danger, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  signOutText: { color: colors.danger, fontSize: 15, fontWeight: '600' },
  version: { textAlign: 'center', color: colors.textDim, fontSize: 12, marginTop: 'auto' },
})
