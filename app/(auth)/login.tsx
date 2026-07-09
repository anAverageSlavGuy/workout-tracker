import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { supabase } from '../../lib/supabase'
import { colors } from '../../constants/colors'

type Tab = 'login' | 'register'

export default function LoginScreen() {
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) Alert.alert('Errore', error.message)
  }

  async function handleRegister() {
    if (!email || !password) return
    if (password.length < 6) { Alert.alert('Errore', 'La password deve essere almeno 6 caratteri'); return }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email: email.trim(), password })
    setLoading(false)
    if (error) Alert.alert('Errore', error.message)
    else Alert.alert('Controlla la tua email', 'Abbiamo inviato un link di conferma.')
  }

  async function handleReset() {
    if (!email) { Alert.alert('Inserisci la tua email prima'); return }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim())
    if (error) Alert.alert('Errore', error.message)
    else Alert.alert('Email inviata', 'Controlla la tua casella di posta.')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>WORKOUT</Text>
        <Text style={styles.subtitle}>Traccia i tuoi progressi</Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'login' && styles.tabActive]}
            onPress={() => setTab('login')}
          >
            <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Accedi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'register' && styles.tabActive]}
            onPress={() => setTab('register')}
          >
            <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>Registrati</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={tab === 'login' ? handleLogin : handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={colors.bg} />
            : <Text style={styles.primaryBtnText}>{tab === 'login' ? 'Accedi' : 'Registrati'}</Text>
          }
        </TouchableOpacity>

        {tab === 'login' && (
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.forgotText}>Password dimenticata?</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  inner: { paddingHorizontal: 28, gap: 12 },
  title: { fontSize: 36, fontWeight: '900', color: colors.accent, letterSpacing: 4, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 16 },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 10, padding: 4, marginBottom: 8 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: colors.surfaceHigh },
  tabText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  tabTextActive: { color: colors.text },
  input: {
    backgroundColor: colors.surface, color: colors.text, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1, borderColor: colors.border,
  },
  primaryBtn: {
    backgroundColor: colors.accent, borderRadius: 10, paddingVertical: 16,
    alignItems: 'center', marginTop: 4,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: colors.bg },
  forgotText: { textAlign: 'center', color: colors.textMuted, fontSize: 13, marginTop: 4 },
})
