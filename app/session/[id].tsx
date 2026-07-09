import { useState, useMemo } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { useSession, useAddSet, useUpdateSet, useDeleteSet } from '../../hooks/useSessions'
import { ExercisePicker } from '../../components/ExercisePicker'
import { SetRow } from '../../components/SetRow'
import { Exercise, SessionSet } from '../../lib/types'
import { colors } from '../../constants/colors'

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const { data: session, isLoading } = useSession(id)
  const addSet = useAddSet()
  const updateSet = useUpdateSet()
  const deleteSet = useDeleteSet()

  const [showPicker, setShowPicker] = useState(false)
  const [newWeight, setNewWeight] = useState<Record<string, string>>({})
  const [newReps, setNewReps] = useState<Record<string, string>>({})

  const setsByExercise = useMemo(() => {
    const map: Record<string, { exercise: Exercise; sets: SessionSet[] }> = {}
    for (const s of session?.session_sets ?? []) {
      if (!s.exercises) continue
      if (!map[s.exercise_id]) map[s.exercise_id] = { exercise: s.exercises, sets: [] }
      map[s.exercise_id].sets.push(s)
    }
    return Object.values(map)
  }, [session])

  function handleBack() {
    if ((session?.session_sets?.length ?? 0) > 0) {
      Alert.alert('Esci', 'Vuoi uscire? I dati sono già salvati.', [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Esci', onPress: () => router.back() },
      ])
    } else {
      router.back()
    }
  }

  async function handleAddExercise(exercise: Exercise) {
    const w = parseFloat(newWeight[exercise.id] ?? '0') || 0
    const r = parseInt(newReps[exercise.id] ?? '10', 10) || 10
    const existingSets = setsByExercise.find(g => g.exercise.id === exercise.id)?.sets ?? []
    await addSet.mutateAsync({
      session_id: id,
      exercise_id: exercise.id,
      set_number: existingSets.length + 1,
      weight: w,
      reps: r,
    })
  }

  async function handleAddSet(exercise: Exercise) {
    const group = setsByExercise.find(g => g.exercise.id === exercise.id)
    const lastSet = group?.sets.at(-1)
    const w = parseFloat(newWeight[exercise.id] ?? '') || (lastSet?.weight ?? 0)
    const r = parseInt(newReps[exercise.id] ?? '', 10) || (lastSet?.reps ?? 10)
    await addSet.mutateAsync({
      session_id: id,
      exercise_id: exercise.id,
      set_number: (group?.sets.length ?? 0) + 1,
      weight: w,
      reps: r,
    })
  }

  if (isLoading || !session) {
    return <View style={styles.loading}><ActivityIndicator color={colors.accent} size="large" /></View>
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={styles.backChar}>↓</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>ALLENAMENTO</Text>
            <Text style={styles.headerDate}>{format(new Date(session.date), 'EEEE d MMMM', { locale: it })}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.addExBtn}>
            <Text style={styles.addExBtnText}>+ ESERCIZIO</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerDivider} />

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {setsByExercise.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyOrnament}>✦</Text>
              <Text style={styles.emptyTitle}>NESSUN ESERCIZIO</Text>
              <Text style={styles.emptyText}>Aggiungi il primo esercizio per iniziare</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowPicker(true)}>
                <Text style={styles.emptyBtnText}>+ AGGIUNGI ESERCIZIO</Text>
              </TouchableOpacity>
            </View>
          )}

          {setsByExercise.map(({ exercise, sets }) => (
            <View key={exercise.id} style={styles.exerciseGroup}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exAccentBar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseName}>{exercise.name.toUpperCase()}</Text>
                  {exercise.equipment && <Text style={styles.equipment}>{exercise.equipment}</Text>}
                </View>
                <Text style={styles.setCount}>{sets.length} SET</Text>
              </View>

              <View style={styles.setHeaders}>
                <Text style={[styles.setHeaderText, { width: 30 }]}>#</Text>
                <Text style={[styles.setHeaderText, { flex: 1 }]}>PESO × REPS</Text>
              </View>

              {sets.map(s => (
                <SetRow
                  key={s.id}
                  set={s}
                  onDelete={() => deleteSet.mutate({ id: s.id, session_id: id })}
                  onUpdate={(w, r, rpe) => updateSet.mutate({ id: s.id, session_id: id, weight: w, reps: r, rpe })}
                />
              ))}

              <View style={styles.addSetRow}>
                <TextInput
                  style={styles.addSetInput}
                  placeholder={sets.at(-1)?.weight.toString() ?? '0'}
                  placeholderTextColor={colors.textDim}
                  keyboardType="decimal-pad"
                  value={newWeight[exercise.id] ?? ''}
                  onChangeText={v => setNewWeight(prev => ({ ...prev, [exercise.id]: v }))}
                />
                <Text style={styles.addSetUnit}>kg</Text>
                <Text style={styles.addSetCross}>×</Text>
                <TextInput
                  style={styles.addSetInput}
                  placeholder={sets.at(-1)?.reps.toString() ?? '10'}
                  placeholderTextColor={colors.textDim}
                  keyboardType="number-pad"
                  value={newReps[exercise.id] ?? ''}
                  onChangeText={v => setNewReps(prev => ({ ...prev, [exercise.id]: v }))}
                />
                <Text style={styles.addSetUnit}>rep</Text>
                <TouchableOpacity
                  style={styles.addSetBtn}
                  onPress={() => handleAddSet(exercise)}
                  disabled={addSet.isPending}
                >
                  {addSet.isPending
                    ? <ActivityIndicator color={colors.text} size="small" />
                    : <Text style={styles.addSetBtnText}>+ SET</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <ExercisePicker visible={showPicker} onClose={() => setShowPicker(false)} onSelect={handleAddExercise} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  backBtn: { padding: 6 },
  backChar: { color: colors.textMuted, fontSize: 20 },
  headerTitle: { fontSize: 13, fontWeight: '900', color: colors.text, letterSpacing: 4 },
  headerDate: { fontSize: 10, color: colors.textMuted, letterSpacing: 2, textTransform: 'capitalize', marginTop: 2 },
  addExBtn: { borderWidth: 1, borderColor: colors.accent, paddingHorizontal: 12, paddingVertical: 8 },
  addExBtnText: { fontSize: 10, fontWeight: '900', color: colors.accent, letterSpacing: 2 },
  headerDivider: { height: 1, backgroundColor: colors.border },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  exerciseGroup: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  exAccentBar: { width: 3, height: 36, backgroundColor: colors.accent },
  exerciseName: { fontSize: 13, fontWeight: '900', color: colors.text, letterSpacing: 2 },
  equipment: { fontSize: 10, color: colors.textMuted, marginTop: 3, letterSpacing: 1 },
  setCount: { fontSize: 9, color: colors.textMuted, letterSpacing: 2 },
  setHeaders: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 6, backgroundColor: colors.bg },
  setHeaderText: { fontSize: 9, color: colors.textDim, fontWeight: '700', letterSpacing: 2 },
  addSetRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border },
  addSetInput: {
    backgroundColor: colors.surface, color: colors.text, paddingHorizontal: 10, paddingVertical: 8,
    fontSize: 15, width: 68, borderWidth: 1, borderColor: colors.border, textAlign: 'center',
  },
  addSetUnit: { fontSize: 11, color: colors.textMuted },
  addSetCross: { fontSize: 11, color: colors.textDim, marginHorizontal: 2 },
  addSetBtn: { flex: 1, borderWidth: 1, borderColor: colors.accent, paddingVertical: 9, alignItems: 'center' },
  addSetBtnText: { fontSize: 11, fontWeight: '900', color: colors.accent, letterSpacing: 3 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyOrnament: { color: colors.accent, fontSize: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: colors.text, letterSpacing: 6 },
  emptyText: { fontSize: 13, color: colors.textMuted, letterSpacing: 1 },
  emptyBtn: { marginTop: 8, borderWidth: 1, borderColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { fontSize: 11, fontWeight: '900', color: colors.accent, letterSpacing: 3 },
})
