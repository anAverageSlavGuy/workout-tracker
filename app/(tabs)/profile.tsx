import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, ActivityIndicator, TextInput, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '../../lib/auth'
import { useNutritionProfile, useUpsertNutritionProfile } from '../../hooks/useNutrition'
import { supabase } from '../../lib/supabase'
import { useConfirmModal } from '../../components/ConfirmModal'
import { colors } from '../../constants/colors'

export default function ProfileScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { data: nutritionProfile, isLoading: isNutritionLoading } = useNutritionProfile()
  const upsertNutritionProfile = useUpsertNutritionProfile()
  const [calorieGoal, setCalorieGoal] = useState('2000')
  const [proteinGoal, setProteinGoal] = useState('120')
  const [carbsGoal, setCarbsGoal] = useState('250')
  const [fatGoal, setFatGoal] = useState('55')
  const { confirm, confirmModal } = useConfirmModal()

  useEffect(() => {
    if (!nutritionProfile) return
    setCalorieGoal(String(nutritionProfile.calorie_goal))
    setProteinGoal(String(nutritionProfile.protein_goal))
    setCarbsGoal(String(nutritionProfile.carbs_goal))
    setFatGoal(String(nutritionProfile.fat_goal))
  }, [nutritionProfile])

  async function handleSignOut() {
    const confirmed = await confirm({
      title: 'ESCI',
      message: 'Vuoi uscire dal profilo?',
      confirmLabel: 'ESCI',
      danger: true,
    })

    if (confirmed) {
      setIsLoggingOut(true)
      await supabase.auth.signOut()
      router.replace('/(auth)/login')
    }
  }

  async function saveNutritionProfile() {
    try {
      await upsertNutritionProfile.mutateAsync({
        calorie_goal: Number(calorieGoal) || 2000,
        protein_goal: Number(proteinGoal) || 120,
        carbs_goal: Number(carbsGoal) || 250,
        fat_goal: Number(fatGoal) || 55,
      })
      if (Platform.OS === 'web') {
        window.alert('Profilo nutrition salvato')
      } else {
        Alert.alert('Salvato', 'Profilo nutrition aggiornato')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Errore durante il salvataggio'
      if (Platform.OS === 'web') window.alert(message)
      else Alert.alert('Errore', message)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>PROFILO</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardAccent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>EMAIL</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NUTRITION</Text>
          <View style={styles.formGrid}>
            <View style={styles.field}>
              <Text style={styles.inputLabel}>KCAL TARGET</Text>
              <TextInput
                style={styles.input}
                value={calorieGoal}
                onChangeText={setCalorieGoal}
                keyboardType="numeric"
                placeholder="2000"
                placeholderTextColor={colors.textDim}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.inputLabel}>PROTEINE G</Text>
              <TextInput
                style={styles.input}
                value={proteinGoal}
                onChangeText={setProteinGoal}
                keyboardType="numeric"
                placeholder="120"
                placeholderTextColor={colors.textDim}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.inputLabel}>CARBO G</Text>
              <TextInput
                style={styles.input}
                value={carbsGoal}
                onChangeText={setCarbsGoal}
                keyboardType="numeric"
                placeholder="250"
                placeholderTextColor={colors.textDim}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.inputLabel}>GRASSI G</Text>
              <TextInput
                style={styles.input}
                value={fatGoal}
                onChangeText={setFatGoal}
                keyboardType="numeric"
                placeholder="55"
                placeholderTextColor={colors.textDim}
              />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.saveBtn, (upsertNutritionProfile.isPending || isNutritionLoading) && styles.signOutBtnDisabled]}
            onPress={saveNutritionProfile}
            disabled={upsertNutritionProfile.isPending || isNutritionLoading}
          >
            {upsertNutritionProfile.isPending
              ? <ActivityIndicator color={colors.text} />
              : <Text style={styles.saveBtnText}>SALVA NUTRITION</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.signOutBtn, isLoggingOut && styles.signOutBtnDisabled]} onPress={handleSignOut} disabled={isLoggingOut}>
          {isLoggingOut
            ? <ActivityIndicator color={colors.accent} />
            : <Text style={styles.signOutText}>ESCI</Text>
          }
        </TouchableOpacity>

        <View style={{ flex: 1 }} />
        <View style={styles.ornamentBottom}>
        </View>
        <Text style={styles.version}>PUMPING IRON v1.0.0</Text>
      </ScrollView>
      {confirmModal}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { flexGrow: 1, padding: 20, paddingBottom: 110, gap: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 2 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 1 },
  card: { flexDirection: 'row', borderRadius: 22, backgroundColor: colors.surface, padding: 18, gap: 16, shadowColor: '#6b625c', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  cardAccent: { width: 5, borderRadius: 3, backgroundColor: colors.accent },
  label: { fontSize: 9, color: colors.textMuted, letterSpacing: 3, marginBottom: 8 },
  value: { fontSize: 15, color: colors.text },
  section: { borderRadius: 22, backgroundColor: colors.surface, padding: 18, gap: 12, shadowColor: '#6b625c', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  sectionTitle: { fontSize: 18, color: colors.text, fontWeight: '900', letterSpacing: 0 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  field: { flex: 1, minWidth: 130, gap: 6 },
  inputLabel: { fontSize: 8, color: colors.textMuted, fontWeight: '900', letterSpacing: 2 },
  input: { borderRadius: 14, color: colors.text, backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  saveBtn: { backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 3 },
  signOutBtn: { backgroundColor: colors.accentDim, borderRadius: 16, paddingVertical: 13, alignItems: 'center', marginTop: 2 },
  signOutBtnDisabled: { opacity: 0.5 },
  signOutText: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 4 },
  version: { textAlign: 'center', color: colors.textDim, fontSize: 9, letterSpacing: 3 },
})
