import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { VictoryChart, VictoryLine, VictoryBar, VictoryAxis, VictoryTheme } from 'victory-native'
import { subDays, format, startOfWeek, eachWeekOfInterval, subWeeks } from 'date-fns'
import { it } from 'date-fns/locale'
import { useSessions } from '../../hooks/useSessions'
import { useExercises } from '../../hooks/useExercises'
import { colors } from '../../constants/colors'
import { epley1RM, Exercise } from '../../lib/types'

type StatTab = 'progressione' | 'frequenza' | 'volume'

export default function StatsScreen() {
  const [tab, setTab] = useState<StatTab>('progressione')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showPicker, setShowPicker] = useState(false)

  const { data: sessions = [] } = useSessions()
  const { data: exercises = [] } = useExercises()

  const tabs: { key: StatTab; label: string }[] = [
    { key: 'progressione', label: 'Progressione' },
    { key: 'frequenza', label: 'Frequenza' },
    { key: 'volume', label: 'Volume' },
  ]

  // Progressione: 1RM stimato per esercizio selezionato
  const progressionData = selectedExercise
    ? sessions
        .flatMap(s => (s.session_sets ?? [])
          .filter(ss => ss.exercise_id === selectedExercise.id)
          .map(ss => ({ date: s.date, orm: epley1RM(ss.weight, ss.reps) }))
        )
        .sort((a, b) => a.date.localeCompare(b.date))
        .reduce<Array<{ x: string; y: number }>>((acc, cur) => {
          const existing = acc.find(p => p.x === cur.date)
          if (existing) { existing.y = Math.max(existing.y, cur.orm) } else { acc.push({ x: cur.date, y: cur.orm }) }
          return acc
        }, [])
    : []

  // Frequenza: sessioni per settimana (ultime 12)
  const weeklyData = (() => {
    const weeks = eachWeekOfInterval(
      { start: subWeeks(new Date(), 11), end: new Date() },
      { weekStartsOn: 1 }
    )
    return weeks.map(weekStart => {
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      const count = sessions.filter(s => {
        const d = s.date
        return d >= weekStart.toISOString().split('T')[0] && d <= weekEnd.toISOString().split('T')[0]
      }).length
      return { x: format(weekStart, 'dd/MM', { locale: it }), y: count }
    })
  })()

  // Volume per gruppo muscolare (ultimi 30 giorni)
  const from30 = subDays(new Date(), 30).toISOString().split('T')[0]
  const volumeByMuscle = sessions
    .filter(s => s.date >= from30)
    .flatMap(s => s.session_sets ?? [])
    .reduce<Record<string, number>>((acc, ss) => {
      const primary = ss.exercises?.exercise_muscles?.find(em => em.role === 'primary')
      if (primary?.muscle_groups?.name) {
        acc[primary.muscle_groups.name] = (acc[primary.muscle_groups.name] ?? 0) + ss.weight * ss.reps
      }
      return acc
    }, {})

  const volumeData = Object.entries(volumeByMuscle)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, vol]) => ({ x: name.slice(0, 5), y: Math.round(vol) }))

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll}>
        <Text style={styles.title}>Statistiche</Text>

        <View style={styles.tabBar}>
          {tabs.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabBtn, tab === t.key && styles.tabActive]}
              onPress={() => setTab(t.key)}
            >
              <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'progressione' && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.picker} onPress={() => setShowPicker(true)}>
              <Text style={styles.pickerText}>{selectedExercise?.name ?? 'Seleziona esercizio'}</Text>
            </TouchableOpacity>
            {progressionData.length > 1 ? (
              <>
                <Text style={styles.chartLabel}>1RM stimato (kg)</Text>
                <VictoryChart theme={VictoryTheme.material} height={240} padding={{ left: 55, right: 24, top: 16, bottom: 40 }}>
                  <VictoryAxis
                    tickFormat={(t: string, i: number) => i % 2 === 0 ? format(new Date(t), 'dd/MM') : ''}
                    style={{ tickLabels: { fill: colors.textMuted, fontSize: 10 }, axis: { stroke: colors.border } }}
                  />
                  <VictoryAxis dependentAxis style={{ tickLabels: { fill: colors.textMuted, fontSize: 10 }, axis: { stroke: colors.border } }} />
                  <VictoryLine data={progressionData} style={{ data: { stroke: colors.accent, strokeWidth: 2 } }} />
                </VictoryChart>
              </>
            ) : (
              <Text style={styles.empty}>{selectedExercise ? 'Dati insufficienti' : 'Seleziona un esercizio'}</Text>
            )}
          </View>
        )}

        {tab === 'frequenza' && (
          <View style={styles.section}>
            <Text style={styles.chartLabel}>Sessioni per settimana (ultime 12)</Text>
            <VictoryChart theme={VictoryTheme.material} height={240} padding={{ left: 44, right: 16, top: 16, bottom: 48 }}>
              <VictoryAxis
                tickFormat={(_: unknown, i: number) => i % 3 === 0 ? (weeklyData[i]?.x ?? '') : ''}
                style={{ tickLabels: { fill: colors.textMuted, fontSize: 9, angle: -30 }, axis: { stroke: colors.border } }}
              />
              <VictoryAxis dependentAxis style={{ tickLabels: { fill: colors.textMuted, fontSize: 10 }, axis: { stroke: colors.border } }} />
              <VictoryBar data={weeklyData} style={{ data: { fill: colors.accent } }} barWidth={14} />
            </VictoryChart>
          </View>
        )}

        {tab === 'volume' && (
          <View style={styles.section}>
            <Text style={styles.chartLabel}>Volume per gruppo muscolare — ultimi 30 giorni (kg × reps)</Text>
            {volumeData.length > 0 ? (
              <VictoryChart theme={VictoryTheme.material} height={280} padding={{ left: 55, right: 16, top: 16, bottom: 40 }}>
                <VictoryAxis style={{ tickLabels: { fill: colors.textMuted, fontSize: 10 }, axis: { stroke: colors.border } }} />
                <VictoryAxis dependentAxis style={{ tickLabels: { fill: colors.textMuted, fontSize: 9 }, axis: { stroke: colors.border } }} />
                <VictoryBar horizontal data={volumeData} style={{ data: { fill: colors.accent } }} barWidth={18} />
              </VictoryChart>
            ) : (
              <Text style={styles.empty}>Nessun dato negli ultimi 30 giorni</Text>
            )}
          </View>
        )}
      </ScrollView>

      <Modal visible={showPicker} animationType="slide" onRequestClose={() => setShowPicker(false)}>
        <SafeAreaView style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Seleziona esercizio</Text>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Text style={{ color: colors.accent, fontSize: 16 }}>Chiudi</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={exercises}
            keyExtractor={e => e.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.pickerRow} onPress={() => { setSelectedExercise(item); setShowPicker(false) }}>
                <Text style={styles.pickerRowText}>{item.name}</Text>
                {item.equipment && <Text style={styles.pickerRowSub}>{item.equipment}</Text>}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, padding: 20, paddingBottom: 12 },
  tabBar: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: colors.surface, borderRadius: 10, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: colors.surfaceHigh },
  tabText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  tabTextActive: { color: colors.accent, fontWeight: '700' },
  section: { paddingHorizontal: 16 },
  chartLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  picker: {
    backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 16,
    paddingVertical: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.border,
  },
  pickerText: { color: colors.text, fontSize: 15 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40, paddingBottom: 40 },
  pickerModal: { flex: 1, backgroundColor: colors.bg },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  pickerRow: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerRowText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  pickerRowSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
})
