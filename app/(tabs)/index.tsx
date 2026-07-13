import { useState } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, ActivityIndicator,
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.ornamentRow}>
            <View style={styles.line} /><Text style={styles.ornamentChar}>✦</Text><View style={styles.line} />
          </View>
          <Text style={styles.appName}>ASCENT</Text>
          <Text style={styles.greeting}>{user?.email?.split('@')[0]}</Text>
          <Text style={styles.dateText}>{format(today, 'EEEE d MMMM', { locale: it })}</Text>
        </View>

        {/* Start button */}
        <TouchableOpacity style={styles.startBtn} onPress={() => setShowModal(true)}>
          <View style={styles.startBtnInner}>
            <Text style={styles.startBtnLabel}>INIZIA ALLENAMENTO</Text>
            <View style={styles.startBtnLine} />
          </View>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{thisWeek}</Text>
            <View style={styles.statDivider} />
            <Text style={styles.statLabel}>SETTIMANA</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{thisMonth}</Text>
            <View style={styles.statDivider} />
            <Text style={styles.statLabel}>MESE</Text>
          </View>
        </View>

        {/* Recent sessions */}
        {recent.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>ULTIMI ALLENAMENTI</Text>
            </View>
            {recent.map(s => (
              <TouchableOpacity key={s.id} style={styles.sessionCard} onPress={() => router.push(`/session/${s.id}`)}>
                <Text style={styles.sessionDate}>{format(new Date(s.date), 'dd/MM', { locale: it })}</Text>
                <View style={styles.sessionDividerV} />
                <Text style={styles.sessionInfo} numberOfLines={1}>
                  {[...new Set(s.session_sets?.map(ss => ss.exercises?.name))].filter(Boolean).slice(0, 3).join(' · ') || 'Nessun set'}
                </Text>
                <Text style={styles.sessionSets}>{s.session_sets?.length ?? 0}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setShowModal(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={[styles.ornamentRow, { marginBottom: 16 }]}>
            <View style={styles.line} /><Text style={styles.ornamentChar}>✦</Text><View style={styles.line} />
          </View>
          <Text style={styles.sheetTitle}>SCEGLI ALLENAMENTO</Text>
          <TouchableOpacity style={styles.sheetOption} onPress={() => startSession()}>
            <Text style={styles.sheetOptionText}>Sessione libera</Text>
            <Text style={styles.sheetOptionSub}>nessun template</Text>
          </TouchableOpacity>
          {templates.map(t => (
            <TouchableOpacity key={t.id} style={[styles.sheetOption, styles.sheetOptionTemplate]} onPress={() => startSession(t.id)}>
              <Text style={styles.sheetOptionText}>{t.name}</Text>
              <Text style={styles.sheetOptionSub}>{t.template_exercises?.length ?? 0} esercizi</Text>
            </TouchableOpacity>
          ))}
          {createSession.isPending && <ActivityIndicator color={colors.accent} style={{ marginTop: 12 }} />}
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: 24, gap: 16 },
  header: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  ornamentChar: { color: colors.accent, fontSize: 12 },
  appName: {
    fontSize: 44, fontWeight: '900', color: colors.text, letterSpacing: 12,
    textShadowColor: colors.accent, textShadowRadius: 16, textShadowOffset: { width: 0, height: 0 },
  },
  greeting: { fontSize: 13, color: colors.silver, letterSpacing: 3, textTransform: 'uppercase' },
  dateText: { fontSize: 11, color: colors.textMuted, letterSpacing: 2, textTransform: 'capitalize' },
  startBtn: {
    borderWidth: 1, borderColor: colors.accent, backgroundColor: colors.accentDim,
    paddingVertical: 20, alignItems: 'center',
  },
  startBtnInner: { alignItems: 'center', gap: 8 },
  startBtnLabel: { fontSize: 14, fontWeight: '900', color: colors.text, letterSpacing: 5 },
  startBtnLine: { width: 40, height: 1, backgroundColor: colors.accent, opacity: 0.6 },
  statsRow: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 20, gap: 8 },
  statSep: { width: 1, backgroundColor: colors.border },
  statNum: { fontSize: 40, fontWeight: '900', color: colors.accent },
  statDivider: { width: 24, height: 1, backgroundColor: colors.border },
  statLabel: { fontSize: 9, color: colors.textMuted, letterSpacing: 3 },
  section: { gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionDot: { width: 5, height: 5, backgroundColor: colors.accent, transform: [{ rotate: '45deg' }] },
  sectionTitle: { fontSize: 10, color: colors.textMuted, letterSpacing: 4 },
  sessionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 16,
  },
  sessionDate: { display: 'flex',fontSize: 13, fontWeight: '700', color: colors.accent, width: 38 },
  sessionDividerV: { width: 1, height: 28, backgroundColor: colors.border },
  sessionInfo: { flex: 1, fontSize: 12, color: colors.textMuted },
  sessionSets: { fontSize: 11, color: colors.textDim },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: {
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
    padding: 24, gap: 8, paddingBottom: 40,
  },
  sheetHandle: { width: 36, height: 3, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 11, color: colors.textMuted, letterSpacing: 5, marginBottom: 8 },
  sheetOption: {
    paddingVertical: 16, paddingHorizontal: 16, marginVertical: 4,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg,
  },
  sheetOptionTemplate: { borderLeftColor: colors.accent, borderLeftWidth: 2 },
  sheetOptionText: { fontSize: 15, fontWeight: '700', color: colors.text, letterSpacing: 1 },
  sheetOptionSub: { fontSize: 11, color: colors.textMuted, marginTop: 4, letterSpacing: 1 },
})
