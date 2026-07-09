import { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView,
} from 'react-native'
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
        <View style={styles.cardHeader}>
          <Text style={styles.cardDate}>{format(new Date(item.date), 'EEE d MMM', { locale: it })}</Text>
          <Text style={styles.cardSets}>{item.session_sets?.length ?? 0} set</Text>
        </View>
        <Text style={styles.cardExercises} numberOfLines={2}>
          {exercises.slice(0, 4).join(' · ') || 'Nessun esercizio'}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Storico</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        <TouchableOpacity
          style={[styles.chip, !selectedMuscle && styles.chipActive]}
          onPress={() => setSelectedMuscle(null)}
        >
          <Text style={[styles.chipText, !selectedMuscle && styles.chipTextActive]}>Tutti</Text>
        </TouchableOpacity>
        {muscleGroups.map(mg => (
          <TouchableOpacity
            key={mg.id}
            style={[styles.chip, selectedMuscle === mg.id && styles.chipActive]}
            onPress={() => setSelectedMuscle(selectedMuscle === mg.id ? null : mg.id)}
          >
            <Text style={[styles.chipText, selectedMuscle === mg.id && styles.chipTextActive]}>{mg.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={sessions}
        keyExtractor={s => s.id}
        renderItem={renderSession}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>{isLoading ? 'Caricamento...' : 'Nessun allenamento trovato'}</Text>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  filterScroll: { maxHeight: 48 },
  filterContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  chipText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  chipTextActive: { color: colors.accent },
  list: { padding: 16, gap: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 6 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontSize: 15, fontWeight: '700', color: colors.text, textTransform: 'capitalize' },
  cardSets: { fontSize: 12, color: colors.textMuted },
  cardExercises: { fontSize: 13, color: colors.textMuted },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 60 },
})
