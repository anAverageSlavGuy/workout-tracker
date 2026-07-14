import { useState, useMemo } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { useSession, useAddSet, useUpdateSet, useDeleteSet, useDeleteSession, useUpdateSessionDate } from '../../hooks/useSessions'
import { ExercisePicker } from '../../components/ExercisePicker'
import { SetRow } from '../../components/SetRow'
import { MuscleActivationBadges } from '../../components/MuscleActivationBadges'
import { Exercise, SessionSet } from '../../lib/types'
import { colors } from '../../constants/colors'

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const { data: session, isLoading } = useSession(id)
  const addSet = useAddSet()
  const updateSet = useUpdateSet()
  const deleteSet = useDeleteSet()
  const deleteSession = useDeleteSession()
  const updateSessionDate = useUpdateSessionDate()

  const [showPicker, setShowPicker] = useState(false)
  const [isEditingDate, setIsEditingDate] = useState(false)
  const [dateInput, setDateInput] = useState('')
  // Stato separato per ogni esercizio: { weight, reps }
  const [inputs, setInputs] = useState<Record<string, { weight: string; reps: string }>>({})

  function getInput(exerciseId: string) {
    return inputs[exerciseId] ?? { weight: '', reps: '' }
  }

  function setInput(exerciseId: string, field: 'weight' | 'reps', value: string) {
    setInputs(prev => ({ ...prev, [exerciseId]: { ...getInput(exerciseId), [field]: value } }))
  }

  function clearInput(exerciseId: string) {
    setInputs(prev => ({ ...prev, [exerciseId]: { weight: '', reps: '' } }))
  }

  const setsByExercise = useMemo(() => {
    const map: Record<string, { exercise: Exercise; sets: SessionSet[] }> = {}
    for (const s of session?.session_sets ?? []) {
      if (!s.exercises) continue
      if (!map[s.exercise_id]) map[s.exercise_id] = { exercise: s.exercises, sets: [] }
      map[s.exercise_id].sets.push(s)
    }
    // Ordina i set per set_number e gli esercizi per il primo set di ogni esercizio
    const result = Object.values(map)
    result.forEach(group => {
      group.sets.sort((a, b) => a.set_number - b.set_number)
    })
    result.sort((a, b) => {
      const aMin = Math.min(...a.sets.map(s => s.set_number))
      const bMin = Math.min(...b.sets.map(s => s.set_number))
      return aMin - bMin
    })
    return result
  }, [session])

  function handleBack() {
    const goBack = () => router.replace('/(tabs)')

    if ((session?.session_sets?.length ?? 0) > 0) {
      Alert.alert('Esci', 'Vuoi uscire? I dati sono già salvati.', [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Esci', onPress: goBack },
      ])
    } else {
      goBack()
    }
  }

  async function handleAddExercise(exercise: Exercise) {
    // Aggiunge l'esercizio con un set placeholder (peso 0, rep dalle input o default 10)
    const maxSetNumber = Math.max(0, ...(session?.session_sets?.map(s => s.set_number) ?? []))
    const { weight, reps } = getInput(exercise.id)
    await addSet.mutateAsync({
      session_id: id,
      exercise_id: exercise.id,
      set_number: maxSetNumber + 1,
      weight: parseFloat(weight) || 0,
      reps: parseInt(reps, 10) || 10,
    })
  }

  async function handleAddSet(exercise: Exercise) {
    const maxSetNumber = Math.max(0, ...(session?.session_sets?.map(s => s.set_number) ?? []))
    const group = setsByExercise.find(g => g.exercise.id === exercise.id)
    const lastSet = group?.sets.at(-1)
    const { weight, reps } = getInput(exercise.id)

    // Usa il valore digitato; se vuoto, ripropone l'ultimo set
    const w = weight.trim() !== '' ? parseFloat(weight) : (lastSet?.weight ?? 0)
    const r = reps.trim() !== '' ? parseInt(reps, 10) : (lastSet?.reps ?? 10)

    if (isNaN(w) || isNaN(r) || r <= 0) return

    await addSet.mutateAsync({
      session_id: id,
      exercise_id: exercise.id,
      set_number: maxSetNumber + 1,
      weight: w,
      reps: r,
    })
    clearInput(exercise.id)
  }

  async function handleDeleteSession() {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Sei sicuro di voler eliminare questo allenamento?')
      : await new Promise(resolve => {
          Alert.alert('Elimina allenamento', 'Sei sicuro di voler eliminare questo allenamento?', [
            { text: 'Annulla', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Elimina', style: 'destructive', onPress: () => resolve(true) },
          ])
        })

    if (confirmed) {
      await deleteSession.mutateAsync(id)
      router.replace('/(tabs)')
    }
  }

  function startEditingDate() {
    setDateInput(session?.date ?? '')
    setIsEditingDate(true)
  }

  function formatDateInput(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    if (digits.length <= 4) return digits
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`
  }

  async function handleUpdateDate() {
    const nextDate = dateInput.trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nextDate)) {
      Alert.alert('Data non valida', 'Inserisci la data nel formato YYYY-MM-DD.')
      return
    }

    const parsed = new Date(`${nextDate}T00:00:00`)
    if (Number.isNaN(parsed.getTime()) || format(parsed, 'yyyy-MM-dd') !== nextDate) {
      Alert.alert('Data non valida', 'Controlla giorno, mese e anno.')
      return
    }

    await updateSessionDate.mutateAsync({ id, date: nextDate })
    setIsEditingDate(false)
  }

  if (isLoading || !session) {
    return <View style={styles.loading}><ActivityIndicator color={colors.accent} size="large" /></View>
  }

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} onLongPress={() => { if (Platform.OS === 'web') window.history.back() }}>
            <Text style={styles.backChar}>↓</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>ALLENAMENTO</Text>
            <Text style={styles.headerDate}>{format(new Date(session.date), 'EEEE d MMMM', { locale: it })}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.addExBtn}>
            <Text style={styles.addExBtnText}>+ ESERCIZIO</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerDivider} />
        {Platform.OS === 'web' && (
          <View style={{ padding: 8, backgroundColor: colors.accentDim, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 12, color: colors.accent, textAlign: 'center', letterSpacing: 1 }}>
              Tieni premuto ↓ per tornare o usa il bottone back del browser
            </Text>
          </View>
        )}

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
                  <Text style={styles.exerciseName}>
                    {exercise.equipment_types
                      ? `${exercise.name.toUpperCase()} (${exercise.equipment_types.name})`
                      : exercise.name.toUpperCase()}
                  </Text>
                  <View style={{ marginTop: 6 }}>
                    <MuscleActivationBadges exercise={exercise} size="small" />
                  </View>
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
                  onUpdate={(w, r, rpe, setType) => updateSet.mutate({ id: s.id, session_id: id, weight: w, reps: r, rpe, set_type: setType })}
                />
              ))}

              <View style={styles.addSetRow}>
                <TextInput
                  style={styles.addSetInput}
                  placeholder={sets.at(-1)?.weight.toString() ?? '0'}
                  placeholderTextColor={colors.textDim}
                  keyboardType="decimal-pad"
                  value={getInput(exercise.id).weight}
                  onChangeText={v => setInput(exercise.id, 'weight', v)}
                />
                <Text style={styles.addSetUnit}>kg</Text>
                <Text style={styles.addSetCross}>×</Text>
                <TextInput
                  style={styles.addSetInput}
                  placeholder={sets.at(-1)?.reps.toString() ?? '10'}
                  placeholderTextColor={colors.textDim}
                  keyboardType="number-pad"
                  value={getInput(exercise.id).reps}
                  onChangeText={v => setInput(exercise.id, 'reps', v)}
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

      <View style={styles.footer}>
        {isEditingDate && (
          <View style={styles.dateEditor}>
            <TextInput
              style={styles.dateInput}
              value={dateInput}
              onChangeText={value => setDateInput(formatDateInput(value))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textDim}
              keyboardType="number-pad"
              maxLength={10}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.saveDateBtn}
              onPress={handleUpdateDate}
              disabled={updateSessionDate.isPending}
            >
              {updateSessionDate.isPending
                ? <ActivityIndicator color={colors.text} size="small" />
                : <Text style={styles.saveDateBtnText}>SALVA</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelDateBtn} onPress={() => setIsEditingDate(false)}>
              <Text style={styles.cancelDateBtnText}>ANNULLA</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.changeDateBtn}
            onPress={startEditingDate}
            disabled={updateSessionDate.isPending}
          >
            <Text style={styles.changeDateBtnText}>CAMBIA DATA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteSessionBtn} onPress={handleDeleteSession} disabled={deleteSession.isPending}>
            {deleteSession.isPending
              ? <ActivityIndicator color={colors.accent} size="small" />
              : <Text style={styles.deleteSessionBtnText}>ELIMINA ALLENAMENTO</Text>
            }
          </TouchableOpacity>
        </View>
      </View>

      <ExercisePicker visible={showPicker} onClose={() => setShowPicker(false)} onSelect={handleAddExercise} />
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8 },
  backBtn: { padding: 8 },
  backChar: { color: colors.textMuted, fontSize: 20 },
  headerTitle: { fontSize: 13, fontWeight: '900', color: colors.text, letterSpacing: 4 },
  headerDate: { fontSize: 10, color: colors.textMuted, letterSpacing: 2, textTransform: 'capitalize', marginTop: 4 },
  addExBtn: { borderWidth: 1, borderColor: colors.accent, paddingHorizontal: 12, paddingVertical: 8 },
  addExBtnText: { fontSize: 10, fontWeight: '900', color: colors.accent, letterSpacing: 2 },
  headerDivider: { height: 1, backgroundColor: colors.border },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  exerciseGroup: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  exAccentBar: { width: 3, height: 36, backgroundColor: colors.accent },
  exerciseName: { fontSize: 13, fontWeight: '900', color: colors.text, letterSpacing: 2 },
  equipment: { fontSize: 10, color: colors.textMuted, marginTop: 4, letterSpacing: 1 },
  setCount: { fontSize: 9, color: colors.textMuted, letterSpacing: 2 },
  setHeaders: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.bg },
  setHeaderText: { fontSize: 9, color: colors.textDim, fontWeight: '700', letterSpacing: 2 },
  addSetRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border },
  addSetInput: {
    backgroundColor: colors.surface, color: colors.text, paddingHorizontal: 8, paddingVertical: 8,
    fontSize: 15, width: 68, borderWidth: 1, borderColor: colors.border, textAlign: 'center',
  },
  addSetUnit: { fontSize: 11, color: colors.textMuted },
  addSetCross: { fontSize: 11, color: colors.textDim, marginHorizontal: 8 },
  addSetBtn: { flex: 1, borderWidth: 1, borderColor: colors.accent, paddingVertical: 8, alignItems: 'center' },
  addSetBtnText: { fontSize: 11, fontWeight: '900', color: colors.accent, letterSpacing: 3 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 16 },
  emptyOrnament: { color: colors.accent, fontSize: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '900', color: colors.text, letterSpacing: 6 },
  emptyText: { fontSize: 13, color: colors.textMuted, letterSpacing: 1 },
  emptyBtn: { marginTop: 8, borderWidth: 1, borderColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { fontSize: 11, fontWeight: '900', color: colors.accent, letterSpacing: 3 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border, gap: 12 },
  footerActions: { flexDirection: 'row', gap: 12 },
  changeDateBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, alignItems: 'center' },
  changeDateBtnText: { fontSize: 11, fontWeight: '900', color: colors.textMuted, letterSpacing: 3 },
  deleteSessionBtn: { flex: 1, borderWidth: 1, borderColor: colors.accent, paddingVertical: 12, alignItems: 'center' },
  deleteSessionBtnText: { fontSize: 10, fontWeight: '900', color: colors.accent, letterSpacing: 1 },
  dateEditor: { flexDirection: 'row', gap: 8 },
  dateInput: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    letterSpacing: 1,
  },
  saveDateBtn: { borderWidth: 1, borderColor: colors.accent, backgroundColor: colors.accent, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center' },
  saveDateBtnText: { fontSize: 10, fontWeight: '900', color: colors.text, letterSpacing: 2 },
  cancelDateBtn: { borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, justifyContent: 'center', alignItems: 'center' },
  cancelDateBtnText: { fontSize: 10, fontWeight: '900', color: colors.textMuted, letterSpacing: 2 },
})
