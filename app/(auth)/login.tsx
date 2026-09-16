import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { supabase } from '../../lib/supabase'
import { colors } from '../../constants/colors'
import { ToastHost, useToast } from '../../components/Toast'

type Tab = 'login' | 'register'

export default function LoginScreen() {
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast, showToast } = useToast(3500)

  async function handleLogin() {
    if (!email || !password) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (error) showToast(error.message, 'error')
  }

  async function handleRegister() {
    if (!email || !password) {
      showToast('Inserisci email e password per registrarti.', 'info')
      return
    }
    if (password.length < 6) {
      showToast('La password deve essere almeno 6 caratteri.', 'error')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email: email.trim(), password })
    setLoading(false)
    if (error) showToast(error.message, 'error')
    else showToast('Registrazione avviata. Controlla la tua email.', 'success')
  }

  async function handleReset() {
    if (!email) {
      showToast('Inserisci la tua email prima.', 'info')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim())
    setLoading(false)
    if (error) showToast(error.message, 'error')
    else showToast('Email di reset inviata. Controlla la posta.', 'success')
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        {/* Decorative lines */}
        <View style={styles.ornamentTop}>
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentDiamond} />
          <View style={styles.ornamentLine} />
        </View>

        <Text style={styles.title}>ASCENT</Text>
        <Text style={styles.subtitle}>track your ascension</Text>

        <View style={styles.ornamentMid}>
          <View style={[styles.ornamentLine, { flex: 1 }]} />
          <Text style={styles.ornamentChar}>✦</Text>
          <View style={[styles.ornamentLine, { flex: 1 }]} />
        </View>

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
          placeholderTextColor={colors.textDim}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textDim}
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
            ? <ActivityIndicator color={colors.text} />
            : <Text style={styles.primaryBtnText}>{tab === 'login' ? 'ACCEDI' : 'REGISTRATI'}</Text>
          }
        </TouchableOpacity>

        {tab === 'login' && (
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.forgotText}>Password dimenticata?</Text>
          </TouchableOpacity>
        )}

        <View style={styles.ornamentBottom}>
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentDiamond} />
          <View style={styles.ornamentLine} />
        </View>
      </View>

      <ToastHost toast={toast} bottom={40} />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  inner: { paddingHorizontal: 32, gap: 16 },
  ornamentTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  ornamentBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  ornamentMid: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 0 },
  ornamentLine: { height: 1, backgroundColor: colors.border, flex: 1 },
  ornamentDiamond: { width: 6, height: 6, backgroundColor: colors.accent, transform: [{ rotate: '45deg' }] },
  ornamentChar: { color: colors.accent, fontSize: 12 },
  title: {
    fontSize: 42, fontWeight: '900', color: colors.text,
    letterSpacing: 8, textAlign: 'center', lineHeight: 46,
    textShadowColor: colors.accent, textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: { fontSize: 11, color: colors.textMuted, textAlign: 'center', letterSpacing: 5, textTransform: 'uppercase', marginTop: -8 },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 2, borderWidth: 1, borderColor: colors.border },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { backgroundColor: colors.accentDim, borderWidth: 0 },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.textMuted, letterSpacing: 2, textTransform: 'uppercase' },
  tabTextActive: { color: colors.accent },
  input: {
    backgroundColor: colors.surface, color: colors.text, borderRadius: 2,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    borderWidth: 1, borderColor: colors.border, letterSpacing: 1,
  },
  primaryBtn: {
    backgroundColor: colors.accent, borderRadius: 2, paddingVertical: 16,
    alignItems: 'center', marginTop: 0,
  },
  primaryBtnText: { fontSize: 13, fontWeight: '900', color: colors.text, letterSpacing: 4 },
  forgotText: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: -4, letterSpacing: 1 },
})
