import { useState, useMemo } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'
import { it } from 'date-fns/locale'
import { useSessions } from '../../hooks/useSessions'
import { useMuscleGroups } from '../../hooks/useExercises'
import { colors } from '../../constants/colors'
import { Session } from '../../lib/types'

export default function HistoryScreen() {
  const router = useRouter()
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { data: muscleGroups = [] } = useMuscleGroups()
  const { data: sessions = [], isLoading } = useSessions(
    selectedMuscle ? { muscleGroupId: selectedMuscle } : undefined
  )

  const sessionsByDate = useMemo(() => {
    const map: Record<string, Session[]> = {}
    sessions.forEach(s => {
      const dateStr = s.date
      if (!map[dateStr]) map[dateStr] = []
      map[dateStr].push(s)
    })
    return map
  }, [sessions])

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  function renderSession({ item }: { item: Session }) {
    const exercises = [...new Set(item.session_sets?.map(s => s.exercises?.name))].filter(Boolean)
    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push(`/session/${item.id}`)}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardDay}>{format(new Date(item.date), 'dd', { locale: it })}</Text>
          <Text style={styles.cardMonth}>{format(new Date(item.date), 'MMM', { locale: it }).toUpperCase()}</Text>
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.cardRight}>
          <Text style={styles.cardExercises} numberOfLines={1}>
            {exercises.slice(0, 3).join(' · ') || 'Nessun esercizio'}
          </Text>
          <Text style={styles.cardSets}>{item.session_sets?.length ?? 0} SET</Text>
        </View>
        <View style={styles.cardArrow}><Text style={{ color: colors.accent, fontSize: 16 }}>›</Text></View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerWrap}>
        <View style={styles.ornamentRow}>
          <View style={styles.line} /><Text style={styles.ornamentChar}>✦</Text><View style={styles.line} />
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.title}>STORICO</Text>
          <View style={styles.viewTabs}>
            <TouchableOpacity style={[styles.viewTab, view === 'list' && styles.viewTabActive]} onPress={() => setView('list')}>
              <Text style={[styles.viewTabText, view === 'list' && styles.viewTabTextActive]}>LIST</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.viewTab, view === 'calendar' && styles.viewTabActive]} onPress={() => setView('calendar')}>
              <Text style={[styles.viewTabText, view === 'calendar' && styles.viewTabTextActive]}>CAL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        <TouchableOpacity
          style={[styles.chip, !selectedMuscle && styles.chipActive]}
          onPress={() => setSelectedMuscle(null)}
        >
          <Text style={[styles.chipText, !selectedMuscle && styles.chipTextActive]}>TUTTI</Text>
        </TouchableOpacity>
        {muscleGroups.map(mg => (
          <TouchableOpacity
            key={mg.id}
            style={[styles.chip, selectedMuscle === mg.id && styles.chipActive]}
            onPress={() => setSelectedMuscle(selectedMuscle === mg.id ? null : mg.id)}
          >
            <Text style={[styles.chipText, selectedMuscle === mg.id && styles.chipTextActive]}>{mg.name.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {view === 'list' ? (
        <FlatList
          style={styles.flatlist}
          data={sessions}
          keyExtractor={s => s.id}
          renderItem={renderSession}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
          ListEmptyComponent={
            <Text style={styles.empty}>{isLoading ? '...' : 'Nessun allenamento trovato'}</Text>
          }
        />
      ) : (
        <ScrollView contentContainerStyle={styles.calendarContent}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
              <Text style={styles.calendarNav}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.calendarMonth}>{format(currentMonth, 'MMMM yyyy', { locale: it }).toUpperCase()}</Text>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
              <Text style={styles.calendarNav}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calendarWeekHeader}>
            {['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'].map(day => (
              <Text key={day} style={styles.calendarWeekDay}>{day}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const hasSessions = dateStr in sessionsByDate
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
              const sessionsForDay = sessionsByDate[dateStr] || []

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[styles.calendarDay, !isCurrentMonth && styles.calendarDayOther, hasSessions && styles.calendarDayHasSessions]}
                  onPress={() => hasSessions && router.push(`/session/${sessionsForDay[0].id}`)}
                >
                  <Text style={[styles.calendarDayNum, !isCurrentMonth && styles.calendarDayNumOther, hasSessions && styles.calendarDayNumActive]}>
                    {day.getDate()}
                  </Text>
                  {hasSessions && <View style={styles.calendarDayDot} />}
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerWrap: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12, gap: 8 },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  ornamentChar: { color: colors.accent, fontSize: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 8 },
  viewTabs: { flexDirection: 'row', gap: 4 },
  viewTab: { paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  viewTabActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  viewTabText: { fontSize: 8, fontWeight: '900', color: colors.textMuted, letterSpacing: 1 },
  viewTabTextActive: { color: colors.accent },
  filterScroll: { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center', paddingVertical: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', minHeight: 28, height: 28 },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 9, color: colors.textMuted, letterSpacing: 1, fontWeight: '700' },
  chipTextActive: { color: colors.bg },
  flatlist: { flex: 1 },
  list: { paddingVertical: 0 },
  card: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, gap: 16, backgroundColor: colors.bg },
  cardLeft: { alignItems: 'center', width: 36 },
  cardDay: { fontSize: 22, fontWeight: '900', color: colors.accent, lineHeight: 24 },
  cardMonth: { fontSize: 9, color: colors.textMuted, letterSpacing: 2 },
  cardDivider: { width: 1, height: 36, backgroundColor: colors.border },
  cardRight: { flex: 1, gap: 4 },
  cardExercises: { fontSize: 13, color: colors.text, fontWeight: '500' },
  cardSets: { fontSize: 9, color: colors.textMuted, letterSpacing: 2 },
  cardArrow: { paddingLeft: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 60, letterSpacing: 2 },
  calendarContent: { padding: 16, gap: 16 },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  calendarNav: { fontSize: 20, color: colors.accent, fontWeight: '900', paddingHorizontal: 12 },
  calendarMonth: { fontSize: 14, fontWeight: '900', color: colors.text, letterSpacing: 2 },
  calendarWeekHeader: { flexDirection: 'row', marginBottom: 8 },
  calendarWeekDay: { flex: 1, textAlign: 'center', fontSize: 9, fontWeight: '900', color: colors.textMuted, letterSpacing: 1 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDay: { width: '14.285%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  calendarDayOther: { opacity: 0.3, backgroundColor: colors.bg },
  calendarDayHasSessions: { backgroundColor: colors.accentDim, borderColor: colors.accent, borderWidth: 2 },
  calendarDayNum: { fontSize: 12, fontWeight: '700', color: colors.text },
  calendarDayNumOther: { color: colors.textMuted },
  calendarDayNumActive: { color: colors.accent },
  calendarDayDot: { width: 4, height: 4, backgroundColor: colors.accent, borderRadius: 2, marginTop: 2 },
})
