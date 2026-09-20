import { useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { SessionSet } from '../lib/types'
import { colors } from '../constants/colors'

interface Props {
  set: SessionSet
  onDelete: () => void
  onUpdate: (weight: number, reps: number, rpe?: number | null, setType?: string | null) => void
}

export function SetRow({ set, onDelete, onUpdate }: Props) {
  const [weight, setWeight] = useState(set.weight.toString())
  const [reps, setReps] = useState(set.reps.toString())
  const [editing, setEditing] = useState(false)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const repsRef = useRef<TextInput>(null)

  useEffect(() => {
    if (!editing) {
      setWeight(set.weight.toString())
      setReps(set.reps.toString())
    }
  }, [editing, set.reps, set.weight])

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
    }
  }, [])

  function save() {
    const w = parseFloat(weight)
    const r = parseInt(reps, 10)
    if (!isNaN(w) && !isNaN(r) && r > 0) onUpdate(w, r, set.rpe, set.set_type)
  }

  function handleFocus() {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
  }

  function handleBlur() {
    save()
    blurTimeoutRef.current = setTimeout(() => setEditing(false), 80)
  }

  function closeEdit() {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current)
    save()
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
            onFocus={handleFocus}
            onBlur={handleBlur}
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
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={closeEdit}
          />
          <Text style={styles.unit}>rep</Text>
        </View>
      ) : (
        <View style={styles.viewMode}>
          <TouchableOpacity style={styles.values} onPress={() => setEditing(true)}>
            <Text style={styles.value}>{set.weight}</Text>
            <Text style={styles.unit}> kg</Text>
            <Text style={styles.cross}>×</Text>
            <Text style={styles.value}>{set.reps}</Text>
            <Text style={styles.unit}> rep</Text>
            {set.rpe != null && <Text style={styles.rpe}>  RPE {set.rpe}</Text>}
          </TouchableOpacity>
          <View style={styles.typeButtons}>
            {(['topset', 'backoff', null] as const).map(type => (
              <TouchableOpacity
                key={type ?? 'none'}
                style={[styles.typeBtn, set.set_type === type && styles.typeBtnActive]}
                onPress={() => onUpdate(set.weight, set.reps, set.rpe, type)}
              >
                <Text style={[styles.typeBtnText, set.set_type === type && styles.typeBtnTextActive]}>
                  {type === 'topset' ? 'T' : type === 'backoff' ? 'B' : '—'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8,
  },
  setNum: { width: 20, fontSize: 11, fontWeight: '900', color: colors.accent, textAlign: 'center', letterSpacing: 1 },
  sep: { width: 1, height: 24, backgroundColor: colors.border },
  viewMode: { flex: 1, flexDirection: 'row', gap: 16 },
  values: { flexDirection: 'row', alignItems: 'center' },
  typeButtons: { flexDirection: 'row', gap: 4 },
  typeBtn: { paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: colors.border, borderRadius: 4 },
  typeBtnActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  typeBtnText: { fontSize: 9, fontWeight: '700', color: colors.textMuted },
  typeBtnTextActive: { color: colors.accent },
  editRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { fontSize: 16, fontWeight: '700', color: colors.text },
  cross: { fontSize: 12, color: colors.textMuted, marginHorizontal: 8 },
  unit: { fontSize: 11, color: colors.textMuted },
  rpe: { fontSize: 11, color: colors.textDim },
  input: {
    backgroundColor: colors.bg, color: colors.accent, paddingHorizontal: 8, paddingVertical: 8,
    fontSize: 16, width: 62, borderWidth: 1, borderColor: colors.accent,
    fontWeight: '700', textAlign: 'center',
  },
  deleteBtn: { padding: 8 },
  deleteChar: { color: colors.danger, fontSize: 12 },
})
