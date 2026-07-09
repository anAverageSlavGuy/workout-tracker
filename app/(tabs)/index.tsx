import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, FlatList, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { format, startOfWeek, startOfMonth } from 'date-fns'
import { it } from 'date-fns/locale'
import { useAuth } from '../../lib/auth'
import { useSessions, useCreateSession } from '../../hooks/useSessions'
import { useTemplates } from '../../hooks/useTemplates'
import { colors } from '../../constants/colors'

export default function DashboardScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  const { data: sessions = [] } = useSessions()
  const { data: templates = [] } = useTemplates()
  const createSession = useCreateSession()

  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }).toISOString().split('T')[0]
  const monthStart = startOfMonth(today).toISOString().split('T')[0]

  const thisWeek = sessions.filter(s => s.date >= weekStart).length
  const thisMonth = sessions.filter(s => s.date >= monthStart).length
  const recent = sessions.slice(0, 3)

  async function startSession(templateId?: string) {
    setShowModal(false)
    const session = await createSession.mutateAsync({ template_id: templateId })
    router.push(`/session/${session.id}`)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>Ciao, {user?.email?.split('@')[0]} 👋</Text>
        <Text style={styles.date}>{format(today, 'EEEE d MMMM', { locale: it })}</Text>

        <TouchableOpacity style={styles.startBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.startBtnText}>+ Inizia Allenamento</Text>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{thisWeek}</Text>
            <Text style={styles.statLabel}>questa settimana</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{thisMonth}</Text>
            <Text style={styles.statLabel}>questo mese</Text>
          </View>
        </View>

        {recent.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Ultimi allenamenti</Text>
            {recent.map(s => (
              <TouchableOpacity key={s.id} style={styles.sessionCard} onPress={() => router.push(`/session/${s.id}`)}>
                <Text style={styles.sessionDate}>{format(new Date(s.date), 'd MMM', { locale: it })}</Text>
                <Text style={styles.sessionInfo}>
                  {[...new Set(s.session_sets?.map(ss => ss.exercises?.name))].filter(Boolean).slice(0, 3).join(' · ') || 'Nessun set'}
                </Text>
                <Text style={styles.sessionSets}>{s.session_sets?.length ?? 0} set</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowModal(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Inizia allenamento</Text>
          <TouchableOpacity style={styles.sheetOption} onPress={() => startSession()}>
            <Text style={styles.sheetOptionText}>Sessione libera</Text>
          </TouchableOpacity>
          {templates.map(t => (
            <TouchableOpacity key={t.id} style={styles.sheetOption} onPress={() => startSession(t.id)}>
              <Text style={styles.sheetOptionText}>{t.name}</Text>
              <Text style={styles.sheetOptionSub}>{t.template_exercises?.length ?? 0} esercizi</Text>
            </TouchableOpacity>
          ))}
          {createSession.isPending && <ActivityIndicator color={colors.accent} style={{ marginTop: 8 }} />}
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 16 },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text },
  date: { fontSize: 14, color: colors.textMuted, marginTop: -8 },
  startBtn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  startBtnText: { fontSize: 17, fontWeight: '800', color: colors.bg },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 16, alignItems: 'center' },
  statNum: { fontSize: 32, fontWeight: '800', color: colors.accent },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  sessionCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  sessionDate: { fontSize: 13, fontWeight: '700', color: colors.accent, width: 40 },
  sessionInfo: { flex: 1, fontSize: 13, color: colors.textMuted },
  sessionSets: { fontSize: 12, color: colors.textDim },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, gap: 4, paddingBottom: 40,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  sheetOption: {
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10,
    backgroundColor: colors.surfaceHigh, marginVertical: 3,
  },
  sheetOptionText: { fontSize: 15, fontWeight: '600', color: colors.text },
  sheetOptionSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
})
