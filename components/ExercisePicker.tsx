import { useState } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
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
          <Text style={styles.title}>Aggiungi esercizio</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.search}
            placeholder="Cerca esercizio..."
            placeholderTextColor={colors.textMuted}
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
              <Text style={styles.groupLabel}>{group}</Text>
              {exs.map(ex => (
                <TouchableOpacity key={ex.id} style={styles.exRow} onPress={() => { onSelect(ex); onClose() }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exName}>{ex.name}</Text>
                    {ex.equipment && <Text style={styles.exEquip}>{ex.equipment}</Text>}
                  </View>
                  <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: colors.border },
  search: { flex: 1, color: colors.text, fontSize: 15 },
  groupLabel: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  exName: { fontSize: 15, color: colors.text, fontWeight: '500' },
  exEquip: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
})
