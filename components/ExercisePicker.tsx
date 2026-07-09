import { useState } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useExercises } from '../hooks/useExercises'
import { Exercise } from '../lib/types'
import { colors } from '../constants/colors'

interface Props {
  visible: boolean
  onClose: () => void
  onSelect: (exercise: Exercise) => void
}

export function ExercisePicker({ visible, onClose, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const { data: exercises = [] } = useExercises()

  const filtered = exercises.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.equipment ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce<Record<string, Exercise[]>>((acc, ex) => {
    const primary = ex.exercise_muscles?.find(em => em.role === 'primary')?.muscle_groups?.name ?? 'Altro'
    if (!acc[primary]) acc[primary] = []
    acc[primary].push(ex)
    return acc
  }, {})

  const sections = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>AGGIUNGI ESERCIZIO</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.search}
            placeholder="cerca esercizio..."
            placeholderTextColor={colors.textDim}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
        </View>

        <FlatList
          data={sections}
          keyExtractor={([group]) => group}
          renderItem={({ item: [group, exs] }) => (
            <View>
              <View style={styles.groupHeader}>
                <View style={styles.groupDot} />
                <Text style={styles.groupLabel}>{group.toUpperCase()}</Text>
              </View>
              {exs.map(ex => (
                <TouchableOpacity key={ex.id} style={styles.exRow} onPress={() => { onSelect(ex); onClose() }}>
                  <View style={styles.exAccent} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exName}>{ex.name}</Text>
                    {ex.equipment && <Text style={styles.exEquip}>{ex.equipment}</Text>}
                  </View>
                  <Text style={styles.addChar}>+</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 14, fontWeight: '900', color: colors.text, letterSpacing: 5 },
  closeText: { color: colors.textMuted, fontSize: 16 },
  divider: { height: 1, backgroundColor: colors.border },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: colors.surface },
  searchIcon: { color: colors.textMuted, fontSize: 18 },
  search: { flex: 1, color: colors.text, fontSize: 14 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 },
  groupDot: { width: 4, height: 4, backgroundColor: colors.accent, transform: [{ rotate: '45deg' }] },
  groupLabel: { fontSize: 9, fontWeight: '700', color: colors.accent, letterSpacing: 4 },
  exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12 },
  exAccent: { width: 2, height: 28, backgroundColor: colors.border },
  exName: { fontSize: 14, color: colors.text },
  exEquip: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  addChar: { color: colors.accent, fontSize: 20, fontWeight: '300' },
})
