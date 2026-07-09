import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
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

  function commit() {
    const w = parseFloat(weight)
    const r = parseInt(reps, 10)
    if (!isNaN(w) && !isNaN(r) && r > 0) {
      onUpdate(w, r, set.rpe)
    }
    setEditing(false)
  }

  return (
    <View style={styles.row}>
      <Text style={styles.setNum}>{set.set_number}</Text>

      {editing ? (
        <>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            autoFocus
            onBlur={commit}
            onSubmitEditing={commit}
          />
          <Text style={styles.unit}>kg</Text>
          <TextInput
            style={styles.input}
            value={reps}
            onChangeText={setReps}
            keyboardType="number-pad"
            onBlur={commit}
            onSubmitEditing={commit}
          />
          <Text style={styles.unit}>rep</Text>
        </>
      ) : (
        <TouchableOpacity style={styles.values} onPress={() => setEditing(true)}>
          <Text style={styles.value}>{set.weight} <Text style={styles.unit}>kg</Text></Text>
          <Text style={styles.sep}>×</Text>
          <Text style={styles.value}>{set.reps} <Text style={styles.unit}>rep</Text></Text>
          {set.rpe != null && <Text style={styles.rpe}>RPE {set.rpe}</Text>}
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
        <Ionicons name="close-circle" size={20} color={colors.textDim} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8,
  },
  setNum: { width: 22, fontSize: 13, fontWeight: '700', color: colors.textMuted, textAlign: 'center' },
  values: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { fontSize: 16, fontWeight: '600', color: colors.text },
  sep: { fontSize: 14, color: colors.textMuted },
  rpe: { fontSize: 12, color: colors.textMuted, marginLeft: 4 },
  unit: { fontSize: 12, color: colors.textMuted, fontWeight: '400' },
  input: {
    backgroundColor: colors.bg, color: colors.text, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, fontSize: 16, width: 64,
    borderWidth: 1, borderColor: colors.accent, fontWeight: '600',
  },
  deleteBtn: { padding: 2 },
})
