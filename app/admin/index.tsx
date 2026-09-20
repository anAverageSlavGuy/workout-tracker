import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useIsAdmin } from '../../hooks/useAdmin'
import { useEquipmentTypes, useExercisesAdmin, useExerciseMuscles, useMuscleGroupsAdmin } from '../../hooks/useAdminQueries'
import { useCreateEquipment, useUpdateEquipment, useDeleteEquipment, useCreateMuscleGroup, useUpdateMuscleGroup, useDeleteMuscleGroup, useCreateExerciseAdmin, useUpdateExerciseAdmin, useDeleteExerciseAdmin, useCreateExerciseMuscle, useUpdateExerciseMuscle, useDeleteExerciseMuscle } from '../../hooks/useAdminMutations'
import { AdminSelect } from '../../components/AdminSelect'
import { useConfirmModal } from '../../components/ConfirmModal'
import { colors } from '../../constants/colors'

type AdminTab = 'equipment' | 'muscles' | 'exercises' | 'mappings'

export default function AdminScreen() {
  const router = useRouter()
  const [tab, setTab] = useState<AdminTab>('equipment')
  const { data: isAdmin, isLoading } = useIsAdmin()

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    )
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notAllowed}>
          <Text style={styles.notAllowedText}>Accesso negato</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Indietro</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const tabs: { key: AdminTab; label: string }[] = [
    { key: 'equipment', label: 'EQUIPMENT' },
    { key: 'muscles', label: 'MUSCOLI' },
    { key: 'exercises', label: 'ESERCIZI' },
    { key: 'mappings', label: 'MUSCOLI-ESERCIZI' },
  ]

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>ADMIN</Text>
        <TouchableOpacity onPress={() => {
          router.replace('/(tabs)')
          if (Platform.OS === 'web') window.history.back()
        }}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll}>
        {tab === 'equipment' && <EquipmentSection />}
        {tab === 'muscles' && <MusclesSection />}
        {tab === 'exercises' && <ExercisesSection />}
        {tab === 'mappings' && <MappingsSection />}
      </ScrollView>
    </SafeAreaView>
  )
}

function EquipmentSection() {
  const [name, setName] = useState('')
  const { mutate: create, isPending } = useCreateEquipment()
  const { data: equipment = [] } = useEquipmentTypes()
  const { mutate: deleteEq } = useDeleteEquipment()
  const { confirm, confirmModal } = useConfirmModal()

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Aggiungi Equipment</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome equipment"
        placeholderTextColor={colors.textDim}
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={() => {
          if (!name.trim()) return
          create(name, {
            onSuccess: () => setName(''),
          })
        }}
        disabled={isPending}
      >
        <Text style={styles.submitBtnText}>{isPending ? '...' : 'AGGIUNGI'}</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Equipment esistenti</Text>
      <View style={styles.listContainer}>
        <FlatList
          data={equipment}
          keyExtractor={e => e.id}
          scrollEnabled={true}
          renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{item.name}</Text>
            <TouchableOpacity onPress={async () => {
              if (await confirm({ title: 'ELIMINA', message: `Eliminare "${item.name}"?`, confirmLabel: 'ELIMINA', danger: true })) {
                deleteEq(item.id)
              }
            }} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
          ListEmptyComponent={<Text style={styles.empty}>Nessun equipment</Text>}
        />
      </View>
      {confirmModal}
    </View>
  )
}

function MusclesSection() {
  const [name, setName] = useState('')
  const { mutate: create, isPending } = useCreateMuscleGroup()
  const { data: muscles = [] } = useMuscleGroupsAdmin()
  const { mutate: deleteMuscle } = useDeleteMuscleGroup()
  const { confirm, confirmModal } = useConfirmModal()

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Aggiungi Muscle Group</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome muscolo"
        placeholderTextColor={colors.textDim}
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={() => {
          if (!name.trim()) return
          create(name, {
            onSuccess: () => setName(''),
          })
        }}
        disabled={isPending}
      >
        <Text style={styles.submitBtnText}>{isPending ? '...' : 'AGGIUNGI'}</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Muscoli esistenti</Text>
      <View style={styles.listContainer}>
        <FlatList
          data={muscles}
          keyExtractor={m => m.id}
          scrollEnabled={true}
          renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{item.name}</Text>
            <TouchableOpacity onPress={async () => {
              if (await confirm({ title: 'ELIMINA', message: `Eliminare "${item.name}"?`, confirmLabel: 'ELIMINA', danger: true })) {
                deleteMuscle(item.id)
              }
            }} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
          ListEmptyComponent={<Text style={styles.empty}>Nessun muscolo</Text>}
        />
      </View>
      {confirmModal}
    </View>
  )
}

function ExercisesSection() {
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [equipmentId, setEquipmentId] = useState<string | undefined>(undefined)
  const { data: exercises = [], isLoading } = useExercisesAdmin()
  const { data: equipment = [] } = useEquipmentTypes()
  const { mutate: create, isPending: createPending } = useCreateExerciseAdmin()
  const { mutate: deleteEx } = useDeleteExerciseAdmin()
  const { confirm, confirmModal } = useConfirmModal()

  if (isLoading) return <ActivityIndicator color={colors.accent} size="large" style={{ marginTop: 40 }} />

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Aggiungi Esercizio</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome esercizio"
        placeholderTextColor={colors.textDim}
        value={name}
        onChangeText={setName}
      />
      <AdminSelect
        label="Equipment"
        value={equipmentId}
        onChange={setEquipmentId}
        options={[
          { label: '— Nessuno —', value: undefined },
          ...equipment.map(e => ({ label: e.name, value: e.id })),
        ]}
      />
      <TextInput
        style={[styles.input, { minHeight: 60 }]}
        placeholder="Note (opzionale)"
        placeholderTextColor={colors.textDim}
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={() => {
          if (!name.trim()) return
          create({ name: name.trim(), equipment_id: equipmentId, notes: notes.trim() || undefined }, {
            onSuccess: () => {
              setName('')
              setNotes('')
              setEquipmentId(undefined)
            },
          })
        }}
        disabled={createPending}
      >
        <Text style={styles.submitBtnText}>{createPending ? '...' : 'AGGIUNGI'}</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Esercizi esistenti</Text>
      <View style={styles.listContainer}>
        <FlatList
          data={exercises}
          keyExtractor={e => e.id}
          scrollEnabled={true}
          renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listItemText}>{item.name}</Text>
              <Text style={styles.listItemSub}>
                {item.equipment_types?.name || '—'} {item.notes ? `• ${item.notes}` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={async () => {
              if (await confirm({ title: 'ELIMINA', message: `Eliminare "${item.name}"?`, confirmLabel: 'ELIMINA', danger: true })) {
                deleteEx(item.id)
              }
            }} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
          ListEmptyComponent={<Text style={styles.empty}>Nessun esercizio</Text>}
        />
      </View>
      {confirmModal}
    </View>
  )
}

function MappingsSection() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | undefined>(undefined)
  const [selectedMuscleId, setSelectedMuscleId] = useState<string | undefined>(undefined)
  const [percentage, setPercentage] = useState('50')

  const { data: exercises = [] } = useExercisesAdmin()
  const { data: muscles = [] } = useMuscleGroupsAdmin()
  const { data: mappings = [] } = useExerciseMuscles(selectedExerciseId ?? null)

  const { mutate: create, isPending: createPending } = useCreateExerciseMuscle()
  const { mutate: deleteMuscleMapping } = useDeleteExerciseMuscle()
  const { confirm, confirmModal } = useConfirmModal()

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Aggiungi Mapping Esercizio-Muscolo</Text>

      <AdminSelect
        label="Esercizio"
        value={selectedExerciseId}
        onChange={setSelectedExerciseId}
        options={[
          { label: '— Seleziona esercizio —', value: undefined },
          ...exercises.map(e => ({ label: e.name, value: e.id })),
        ]}
      />

      {selectedExerciseId && (
        <>
          <AdminSelect
            label="Muscolo"
            value={selectedMuscleId}
            onChange={setSelectedMuscleId}
            options={[
              { label: '— Seleziona muscolo —', value: undefined },
              ...muscles.map(m => ({ label: m.name, value: m.id })),
            ]}
          />

          <Text style={styles.label}>Percentuale attivazione: {percentage}%</Text>
          <TextInput
            style={styles.input}
            placeholder="0-100"
            placeholderTextColor={colors.textDim}
            value={percentage}
            onChangeText={setPercentage}
            keyboardType="number-pad"
          />

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={() => {
              if (!selectedMuscleId || !percentage.trim()) return
              const pct = Math.min(100, Math.max(0, parseFloat(percentage) || 0))
              create(
                { exercise_id: selectedExerciseId, muscle_group_id: selectedMuscleId, activation_percentage: pct },
                {
                  onSuccess: () => {
                    setSelectedMuscleId(undefined)
                    setPercentage('50')
                  },
                }
              )
            }}
            disabled={createPending}
          >
            <Text style={styles.submitBtnText}>{createPending ? '...' : 'AGGIUNGI MAPPING'}</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Mappings per {exercises.find(e => e.id === selectedExerciseId)?.name}</Text>
          <View style={styles.listContainer}>
            <FlatList
              data={mappings}
              keyExtractor={m => m.muscle_group_id}
              scrollEnabled={true}
              renderItem={({ item }) => (
              <View style={styles.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listItemText}>{item.muscle_groups?.name}</Text>
                  <Text style={styles.listItemSub}>{item.activation_percentage}% attivazione</Text>
                </View>
                <TouchableOpacity onPress={async () => {
                  if (await confirm({ title: 'ELIMINA', message: `Eliminare mapping "${item.muscle_groups?.name}"?`, confirmLabel: 'ELIMINA', danger: true })) {
                    deleteMuscleMapping({ exercise_id: selectedExerciseId, muscle_group_id: item.muscle_group_id })
                  }
                }} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
              ListEmptyComponent={<Text style={styles.empty}>Nessun mapping</Text>}
            />
          </View>
        </>
      )}
      {confirmModal}
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  notAllowed: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24 },
  notAllowedText: { fontSize: 16, color: colors.textMuted, letterSpacing: 2 },
  backBtn: { borderWidth: 1, borderColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12 },
  backBtnText: { color: colors.accent, fontWeight: '900', letterSpacing: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 14, fontWeight: '900', color: colors.text, letterSpacing: 5 },
  closeBtn: { fontSize: 16, color: colors.textMuted },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRightWidth: 1, borderRightColor: colors.border },
  tabActive: { backgroundColor: colors.accentDim },
  tabText: { fontSize: 8, color: colors.textMuted, fontWeight: '700', letterSpacing: 2 },
  tabTextActive: { color: colors.accent },
  scroll: { flex: 1 },
  section: { padding: 16, gap: 12, paddingBottom: 40 },
  sectionTitle: { fontSize: 11, color: colors.textMuted, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  label: { fontSize: 9, color: colors.textMuted, letterSpacing: 2, marginTop: 12 },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 8, color: colors.text, borderRadius: 4, fontSize: 14 },
  submitBtn: { borderWidth: 1, borderColor: colors.accent, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: colors.accent, fontWeight: '900', fontSize: 11, letterSpacing: 2 },
  listContainer: { maxHeight: 300, borderWidth: 1, borderColor: colors.border, borderRadius: 4, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 12, paddingHorizontal: 12, gap: 12 },
  listItemText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  listItemSub: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  deleteBtn: { padding: 8 },
  deleteBtnText: { color: colors.danger, fontSize: 14 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 20, letterSpacing: 1 },
})
