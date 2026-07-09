import { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, Alert, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTemplates, useCreateTemplate, useDeleteTemplate } from '../../hooks/useTemplates'
import { useExercises } from '../../hooks/useExercises'
import { colors } from '../../constants/colors'
import { Exercise, WorkoutTemplate } from '../../lib/types'

export default function TemplatesScreen() {
  const { data: templates = [], isLoading } = useTemplates()
  const { data: exercises = [] } = useExercises()
  const createTemplate = useCreateTemplate()
  const deleteTemplate = useDeleteTemplate()

  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<Exercise[]>([])

  function toggleExercise(ex: Exercise) {
    setSelected(prev => prev.find(e => e.id === ex.id) ? prev.filter(e => e.id !== ex.id) : [...prev, ex])
  }

  async function handleCreate() {
    if (!name.trim()) return
    await createTemplate.mutateAsync({
      name: name.trim(),
      exercises: selected.map((e, i) => ({ exercise_id: e.id, target_sets: 3, target_reps: 10, position: i })),
    })
    setShowCreate(false)
    setName('')
    setSelected([])
  }

  function handleDelete(t: WorkoutTemplate) {
    Alert.alert('Elimina', `Eliminare il template "${t.name}"?`, [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Elimina', style: 'destructive', onPress: () => deleteTemplate.mutate(t.id) },
    ])
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Template</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)} style={styles.addBtn}>
          <Ionicons name="add" size={24} color={colors.bg} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={templates}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>{isLoading ? 'Caricamento...' : 'Nessun template. Creane uno!'}</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardSub}>
                {item.template_exercises?.map(te => te.exercises?.name).join(', ') || 'Nessun esercizio'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={showCreate} animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nuovo Template</Text>
            <TouchableOpacity onPress={() => setShowCreate(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Nome template (es. Push, Pull, Gambe)"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.pickLabel}>Seleziona esercizi</Text>
          <FlatList
            data={exercises}
            keyExtractor={e => e.id}
            style={{ flex: 1 }}
            renderItem={({ item }) => {
              const isSelected = !!selected.find(e => e.id === item.id)
              return (
                <TouchableOpacity style={styles.exRow} onPress={() => toggleExercise(item)}>
                  <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color={colors.bg} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exName}>{item.name}</Text>
                    {item.equipment && <Text style={styles.exEquip}>{item.equipment}</Text>}
                  </View>
                </TouchableOpacity>
              )
            }}
          />

          <TouchableOpacity
            style={[styles.createBtn, (!name.trim() || createTemplate.isPending) && styles.createBtnDisabled]}
            onPress={handleCreate}
            disabled={!name.trim() || createTemplate.isPending}
          >
            {createTemplate.isPending
              ? <ActivityIndicator color={colors.bg} />
              : <Text style={styles.createBtnText}>Crea Template ({selected.length} esercizi)</Text>
            }
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text },
  addBtn: { backgroundColor: colors.accent, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, gap: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'flex-start' },
  cardName: { fontSize: 16, fontWeight: '700', color: colors.text },
  cardSub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  deleteBtn: { padding: 4 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 60 },
  modal: { flex: 1, backgroundColor: colors.bg, padding: 20, gap: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  input: {
    backgroundColor: colors.surface, color: colors.text, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, borderWidth: 1, borderColor: colors.border,
  },
  pickLabel: { fontSize: 14, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  exName: { fontSize: 15, color: colors.text, fontWeight: '500' },
  exEquip: { fontSize: 12, color: colors.textMuted },
  createBtn: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  createBtnDisabled: { opacity: 0.5 },
  createBtnText: { fontSize: 16, fontWeight: '700', color: colors.bg },
})
