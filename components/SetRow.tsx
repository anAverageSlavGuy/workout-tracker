import { useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { SessionSet } from '../lib/types'
import { colors } from '../constants/colors'

interface Props {
  set: SessionSet
  onDelete: () => void
  onUpdate: (weight: number, reps: number, rpe?: number | null) => void
}

export function SetRow({ set, onDelete, onUpdate }: Props) {
  const [weight, setWeight] = useState(set.weight.toString())
  const [reps, setReps] = useState(set.reps.toString())
  const [editing, setEditing] = useState(false)
  const repsRef = useRef<TextInput>(null)

  function commit() {
    const w = parseFloat(weight)
    const r = parseInt(reps, 10)
    if (!isNaN(w) && !isNaN(r) && r > 0) onUpdate(w, r, set.rpe)
    setEditing(false)
  }

  return (
    <View style={styles.row}>
      <Text style={styles.setNum}>{set.set_number}</Text>
      <View style={styles.sep} />

      {editing ? (
        <View style={styles.editRow}>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            autoFocus
            returnKeyType="next"
            // non committiamo su blur peso: l'utente deve poter spostarsi al campo rep
            onSubmitEditing={() => repsRef.current?.focus()}
          />
          <Text style={styles.unit}>kg</Text>
          <Text style={styles.cross}>×</Text>
          <TextInput
            ref={repsRef}
            style={styles.input}
            value={reps}
            onChangeText={setReps}
            keyboardType="number-pad"
            returnKeyType="done"
            onBlur={commit}
            onSubmitEditing={commit}
          />
          <Text style={styles.unit}>rep</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.values} onPress={() => setEditing(true)}>
          <Text style={styles.value}>{set.weight}</Text>
          <Text style={styles.unit}> kg</Text>
          <Text style={styles.cross}>×</Text>
          <Text style={styles.value}>{set.reps}</Text>
          <Text style={styles.unit}> rep</Text>
          {set.rpe != null && <Text style={styles.rpe}>  RPE {set.rpe}</Text>}
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
        <Text style={styles.deleteChar}>✕</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10,
  },
  setNum: { width: 20, fontSize: 11, fontWeight: '900', color: colors.accent, textAlign: 'center', letterSpacing: 1 },
  sep: { width: 1, height: 24, backgroundColor: colors.border },
  values: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  editRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  value: { fontSize: 16, fontWeight: '700', color: colors.text },
  cross: { fontSize: 12, color: colors.textMuted, marginHorizontal: 6 },
  unit: { fontSize: 11, color: colors.textMuted },
  rpe: { fontSize: 11, color: colors.textDim },
  input: {
    backgroundColor: colors.bg, color: colors.accent, paddingHorizontal: 10, paddingVertical: 6,
    fontSize: 16, width: 62, borderWidth: 1, borderColor: colors.accent,
    fontWeight: '700', textAlign: 'center',
  },
  deleteBtn: { padding: 4 },
  deleteChar: { color: colors.textDim, fontSize: 12 },
})
