import { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
  TextInput, Alert, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTemplates, useCreateTemplate, useDeleteTemplate, useUpdateTemplate, useAddTemplateExercise, useDeleteTemplateExercise } from '../../hooks/useTemplates'
import { useExercises } from '../../hooks/useExercises'
import { colors } from '../../constants/colors'
import { Exercise, WorkoutTemplate } from '../../lib/types'

export default function TemplatesScreen() {
  const { data: templates = [], isLoading } = useTemplates()
  const { data: exercises = [] } = useExercises()
  const createTemplate = useCreateTemplate()
  const deleteTemplate = useDeleteTemplate()
  const updateTemplate = useUpdateTemplate()
  const addTemplateExercise = useAddTemplateExercise()
  const deleteTemplateExercise = useDeleteTemplateExercise()

  const [showCreate, setShowCreate] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null)
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

  function handleEdit(t: WorkoutTemplate) {
    setEditingTemplate(t)
    setName(t.name)
    setSelected(t.template_exercises?.map(te => te.exercises!).filter(Boolean) ?? [])
  }

  async function handleSaveEdit() {
    if (!editingTemplate || !name.trim()) return

    const currentExerciseIds = new Set(editingTemplate.template_exercises?.map(te => te.exercise_id))
    const newExerciseIds = new Set(selected.map(e => e.id))

    // Rimuovi gli esercizi non più selezionati
    for (const exerciseId of currentExerciseIds) {
      if (!newExerciseIds.has(exerciseId)) {
        await deleteTemplateExercise.mutateAsync({ template_id: editingTemplate.id, exercise_id: exerciseId })
      }
    }

    // Aggiungi i nuovi esercizi
    let position = 0
    for (const exercise of selected) {
      if (!currentExerciseIds.has(exercise.id)) {
        await addTemplateExercise.mutateAsync({
          template_id: editingTemplate.id,
          exercise_id: exercise.id,
          target_sets: 3,
          target_reps: 10,
          position,
        })
      }
      position++
    }

    // Aggiorna il nome se cambiato
    if (editingTemplate.name !== name.trim()) {
      await updateTemplate.mutateAsync({ id: editingTemplate.id, name: name.trim() })
    }

    setEditingTemplate(null)
    setName('')
    setSelected([])
  }

  function handleDelete(t: WorkoutTemplate) {
    Alert.alert('Elimina', `Eliminare "${t.name}"?`, [
      { text: 'Annulla', style: 'cancel' },
      { text: 'Elimina', style: 'destructive', onPress: () => deleteTemplate.mutate(t.id) },
    ])
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerWrap}>
        <View style={styles.ornamentRow}>
          <View style={styles.line} /><Text style={styles.ornamentChar}>✦</Text><View style={styles.line} />
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.title}>SCHEDE</Text>
          <TouchableOpacity onPress={() => setShowCreate(true)} style={styles.addBtn}>
            <Ionicons name="add" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={templates}
        keyExtractor={t => t.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
        ListEmptyComponent={
          <Text style={styles.empty}>{isLoading ? '...' : 'Nessuna scheda. Creane una.'}</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardAccent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.name.toUpperCase()}</Text>
              <Text style={styles.cardSub} numberOfLines={1}>
                {item.template_exercises?.map(te => te.exercises?.name).join(', ') || 'Nessun esercizio'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
              <Ionicons name="pencil-outline" size={16} color={colors.textDim} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={16} color={colors.textDim} />
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={showCreate} animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>NUOVA SCHEDA</Text>
            <TouchableOpacity onPress={() => setShowCreate(false)}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.line2} />

          <TextInput
            style={styles.input}
            placeholder="Nome scheda (es. PUSH, PULL, LEGS)"
            placeholderTextColor={colors.textDim}
            value={name}
            onChangeText={setName}
            autoCapitalize="characters"
          />

          <Text style={styles.pickLabel}>SELEZIONA ESERCIZI</Text>
          <FlatList
            data={exercises}
            keyExtractor={e => e.id}
            style={{ flex: 1 }}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
            renderItem={({ item }) => {
              const isSelected = !!selected.find(e => e.id === item.id)
              return (
                <TouchableOpacity style={styles.exRow} onPress={() => toggleExercise(item)}>
                  <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                    {isSelected && <Text style={{ color: colors.text, fontSize: 10, fontWeight: '900' }}>✓</Text>}
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
              ? <ActivityIndicator color={colors.text} />
              : <Text style={styles.createBtnText}>CREA SCHEDA ({selected.length})</Text>
            }
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      <Modal visible={!!editingTemplate} animationType="slide" onRequestClose={() => { setEditingTemplate(null); setSelected([]); setName(''); }}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>MODIFICA SCHEDA</Text>
            <TouchableOpacity onPress={() => { setEditingTemplate(null); setSelected([]); setName(''); }}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.line2} />

          <TextInput
            style={styles.input}
            placeholder="Nome scheda"
            placeholderTextColor={colors.textDim}
            value={name}
            onChangeText={setName}
            autoCapitalize="characters"
          />

          <Text style={styles.pickLabel}>SELEZIONA ESERCIZI</Text>
          <FlatList
            data={exercises}
            keyExtractor={e => e.id}
            style={{ flex: 1 }}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: colors.border }} />}
            renderItem={({ item }) => {
              const isSelected = !!selected.find(e => e.id === item.id)
              return (
                <TouchableOpacity style={styles.exRow} onPress={() => toggleExercise(item)}>
                  <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                    {isSelected && <Text style={{ color: colors.text, fontSize: 10, fontWeight: '900' }}>✓</Text>}
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
            style={[styles.createBtn, (!name.trim() || (addTemplateExercise.isPending || deleteTemplateExercise.isPending || updateTemplate.isPending)) && styles.createBtnDisabled]}
            onPress={handleSaveEdit}
            disabled={!name.trim() || addTemplateExercise.isPending || deleteTemplateExercise.isPending || updateTemplate.isPending}
          >
            {addTemplateExercise.isPending || deleteTemplateExercise.isPending || updateTemplate.isPending
              ? <ActivityIndicator color={colors.text} />
              : <Text style={styles.createBtnText}>SALVA MODIFICHE ({selected.length})</Text>
            }
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerWrap: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12, gap: 8 },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  line2: { height: 1, backgroundColor: colors.border, marginBottom: 16 },
  ornamentChar: { color: colors.accent, fontSize: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 8 },
  addBtn: { width: 32, height: 32, borderWidth: 1, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  list: { paddingTop: 0 },
  card: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, gap: 16, backgroundColor: colors.bg },
  cardAccent: { width: 2, height: 40, backgroundColor: colors.accent },
  cardName: { fontSize: 14, fontWeight: '900', color: colors.text, letterSpacing: 3 },
  cardSub: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  actionBtn: { padding: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 60, letterSpacing: 2 },
  modal: { flex: 1, backgroundColor: colors.bg, padding: 24, gap: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '900', color: colors.text, letterSpacing: 6 },
  input: {
    backgroundColor: colors.surface, color: colors.text, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, borderWidth: 1, borderColor: colors.border, letterSpacing: 2,
  },
  pickLabel: { fontSize: 9, color: colors.textMuted, letterSpacing: 4, marginTop: 8 },
  exRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, gap: 16 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  exName: { fontSize: 14, color: colors.text },
  exEquip: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  createBtn: { backgroundColor: colors.accent, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  createBtnDisabled: { opacity: 0.4 },
  createBtnText: { fontSize: 12, fontWeight: '900', color: colors.text, letterSpacing: 4 },
})
