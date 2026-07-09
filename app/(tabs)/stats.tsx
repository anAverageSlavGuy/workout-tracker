import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { VictoryChart, VictoryLine, VictoryBar, VictoryAxis, VictoryTheme } from 'victory-native'
import { subDays, format, eachWeekOfInterval, subWeeks } from 'date-fns'
import { it } from 'date-fns/locale'
import { useSessions } from '../../hooks/useSessions'
import { useExercises } from '../../hooks/useExercises'
import { colors } from '../../constants/colors'
import { epley1RM, Exercise } from '../../lib/types'

type StatTab = 'progressione' | 'frequenza' | 'volume'

const chartTheme = {
  ...VictoryTheme.material,
  axis: {
    ...VictoryTheme.material.axis,
    style: {
      axis: { stroke: colors.border },
      grid: { stroke: colors.border, strokeDasharray: '4,4', strokeOpacity: 0.4 },
      ticks: { stroke: 'transparent' },
      tickLabels: { fill: colors.textMuted, fontSize: 9, fontFamily: 'monospace' },
    },
  },
}

export default function StatsScreen() {
  const [tab, setTab] = useState<StatTab>('progressione')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showPicker, setShowPicker] = useState(false)

  const { data: sessions = [] } = useSessions()
  const { data: exercises = [] } = useExercises()

  const tabs: { key: StatTab; label: string }[] = [
    { key: 'progressione', label: 'PROGRESSO' },
    { key: 'frequenza', label: 'FREQUENZA' },
    { key: 'volume', label: 'VOLUME' },
  ]

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
        <View style={styles.headerWrap}>
          <View style={styles.ornamentRow}>
            <View style={styles.line} /><Text style={styles.ornamentChar}>✦</Text><View style={styles.line} />
          </View>
          <Text style={styles.title}>STATISTICHE</Text>
        </View>

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
              <Text style={styles.pickerLabel}>ESERCIZIO</Text>
              <Text style={styles.pickerText}>{selectedExercise?.name ?? '— seleziona —'}</Text>
            </TouchableOpacity>
            {progressionData.length > 1 ? (
              <>
                <Text style={styles.chartLabel}>1RM STIMATO (kg) — Formula Epley</Text>
                <VictoryChart theme={chartTheme} height={240} padding={{ left: 55, right: 24, top: 16, bottom: 40 }}>
                  <VictoryAxis
                    tickFormat={(t: string, i: number) => i % 2 === 0 ? format(new Date(t), 'dd/MM') : ''}
                  />
                  <VictoryAxis dependentAxis />
                  <VictoryLine
                    data={progressionData}
                    style={{ data: { stroke: colors.accent, strokeWidth: 2 } }}
                  />
                </VictoryChart>
              </>
            ) : (
              <Text style={styles.empty}>{selectedExercise ? 'Dati insufficienti' : 'Seleziona un esercizio per vedere il grafico'}</Text>
            )}
          </View>
        )}

        {tab === 'frequenza' && (
          <View style={styles.section}>
            <Text style={styles.chartLabel}>SESSIONI PER SETTIMANA — ultime 12</Text>
            <VictoryChart theme={chartTheme} height={240} padding={{ left: 44, right: 16, top: 16, bottom: 48 }}>
              <VictoryAxis
                tickFormat={(_: unknown, i: number) => i % 3 === 0 ? (weeklyData[i]?.x ?? '') : ''}
                style={{ tickLabels: { angle: -30, fontSize: 9, fill: colors.textMuted } }}
              />
              <VictoryAxis dependentAxis />
              <VictoryBar data={weeklyData} style={{ data: { fill: colors.accent } }} barWidth={14} />
            </VictoryChart>
          </View>
        )}

        {tab === 'volume' && (
          <View style={styles.section}>
            <Text style={styles.chartLabel}>VOLUME PER GRUPPO — ultimi 30 giorni</Text>
            {volumeData.length > 0 ? (
              <VictoryChart theme={chartTheme} height={280} padding={{ left: 55, right: 16, top: 16, bottom: 40 }}>
                <VictoryAxis style={{ tickLabels: { fontSize: 9, fill: colors.textMuted } }} />
                <VictoryAxis dependentAxis style={{ tickLabels: { fontSize: 9, fill: colors.textMuted } }} />
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
            <Text style={styles.pickerTitle}>SELEZIONA ESERCIZIO</Text>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Text style={{ color: colors.accent, fontSize: 13, letterSpacing: 2 }}>CHIUDI</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <FlatList
            data={exercises}
            keyExtractor={e => e.id}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.pickerRow} onPress={() => { setSelectedExercise(item); setShowPicker(false) }}>
                <View style={styles.pickerDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickerRowText}>{item.name}</Text>
                  {item.equipment && <Text style={styles.pickerRowSub}>{item.equipment}</Text>}
                </View>
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
  headerWrap: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12, gap: 8 },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  ornamentChar: { color: colors.accent, fontSize: 12 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 8 },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRightWidth: 1, borderRightColor: colors.border },
  tabActive: { backgroundColor: colors.accentDim },
  tabText: { fontSize: 9, color: colors.textMuted, letterSpacing: 3, fontWeight: '700' },
  tabTextActive: { color: colors.accent },
  section: { paddingHorizontal: 16, paddingBottom: 32 },
  chartLabel: { fontSize: 9, color: colors.textMuted, letterSpacing: 3, marginBottom: 8, marginTop: 4 },
  picker: { borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 16, backgroundColor: colors.surface },
  pickerLabel: { fontSize: 9, color: colors.textMuted, letterSpacing: 3, marginBottom: 4 },
  pickerText: { color: colors.text, fontSize: 14 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40, paddingBottom: 40, letterSpacing: 2, fontSize: 12 },
  pickerModal: { flex: 1, backgroundColor: colors.bg },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  pickerTitle: { fontSize: 14, fontWeight: '900', color: colors.text, letterSpacing: 5 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, gap: 14 },
  pickerDot: { width: 4, height: 4, backgroundColor: colors.accent, transform: [{ rotate: '45deg' }] },
  pickerRowText: { fontSize: 14, color: colors.text },
  pickerRowSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
})
