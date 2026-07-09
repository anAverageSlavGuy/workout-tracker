import { useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { useSessions } from '../../hooks/useSessions'
import { useMuscleGroups } from '../../hooks/useExercises'
import { colors } from '../../constants/colors'
import { Session } from '../../lib/types'

export default function HistoryScreen() {
  const router = useRouter()
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)
  const { data: muscleGroups = [] } = useMuscleGroups()
  const { data: sessions = [], isLoading } = useSessions(
    selectedMuscle ? { muscleGroupId: selectedMuscle } : undefined
  )

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
        <Text style={styles.title}>STORICO</Text>
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

      <FlatList
        data={sessions}
        keyExtractor={s => s.id}
        renderItem={renderSession}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
        ListEmptyComponent={
          <Text style={styles.empty}>{isLoading ? '...' : 'Nessun allenamento trovato'}</Text>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerWrap: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12, gap: 8 },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  ornamentChar: { color: colors.accent, fontSize: 12 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 8 },
  filterScroll: { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.border },
  filterContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center', paddingVertical: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  chipText: { fontSize: 9, color: colors.textMuted, letterSpacing: 2, fontWeight: '700' },
  chipTextActive: { color: colors.accent },
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
})
