import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
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
          <View style={styles.closeBtn}>
            <Ionicons name="close" size={25} color={colors.textMuted} />
          </View>
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
              <Ionicons name="close" size={23} color={colors.danger} />
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
              <Ionicons name="close" size={23} color={colors.danger} />
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
              <Ionicons name="close" size={23} color={colors.danger} />
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
                  <Ionicons name="close" size={23} color={colors.danger} />
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
  notAllowed: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 24, padding: 24 },
  notAllowedText: { fontSize: 16, color: colors.textMuted, letterSpacing: 2 },
  backBtn: { backgroundColor: colors.accent, borderRadius: 17, paddingHorizontal: 24, paddingVertical: 13 },
  backBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 1 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: colors.surface, marginHorizontal: 16, marginBottom: 4, padding: 4, borderRadius: 18 },
  tab: { flex: 1, minHeight: 58, paddingHorizontal: 4, paddingVertical: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  tabActive: { backgroundColor: colors.accentDim },
  tabText: { fontSize: 8, lineHeight: 11, textAlign: 'center', color: colors.textMuted, fontWeight: '700', letterSpacing: 2 },
  tabTextActive: { color: colors.accent },
  scroll: { flex: 1 },
  section: { margin: 16, padding: 18, gap: 12, paddingBottom: 40, borderRadius: 22, backgroundColor: colors.surface, shadowColor: '#6b625c', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  sectionTitle: { fontSize: 18, color: colors.text, fontWeight: '900', letterSpacing: 0, marginBottom: 8 },
  label: { fontSize: 9, color: colors.textMuted, letterSpacing: 2, marginTop: 12 },
  input: { backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 11, color: colors.text, borderRadius: 14, fontSize: 14 },
  submitBtn: { backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 13, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  listContainer: { maxHeight: 300, borderRadius: 16, overflow: 'hidden', backgroundColor: '#f1eeeb' },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: '#e2ddd8' },
  listItemText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  listItemSub: { color: colors.textMuted, fontSize: 10, marginTop: 4 },
  deleteBtn: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#fbe1de', alignItems: 'center', justifyContent: 'center' },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 20, letterSpacing: 1 },
})
