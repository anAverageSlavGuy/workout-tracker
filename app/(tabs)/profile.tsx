import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, ActivityIndicator, TextInput, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../lib/auth'
import { useIsAdmin } from '../../hooks/useAdmin'
import { useNutritionProfile, useUpsertNutritionProfile } from '../../hooks/useNutrition'
import { supabase } from '../../lib/supabase'
import { colors } from '../../constants/colors'

export default function ProfileScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { data: isAdmin } = useIsAdmin()
  const { data: nutritionProfile, isLoading: isNutritionLoading } = useNutritionProfile()
  const upsertNutritionProfile = useUpsertNutritionProfile()
  const [calorieGoal, setCalorieGoal] = useState('2000')
  const [proteinGoal, setProteinGoal] = useState('120')
  const [carbsGoal, setCarbsGoal] = useState('250')
  const [fatGoal, setFatGoal] = useState('55')

  console.log('isAdmin', isAdmin)

  useEffect(() => {
    if (!nutritionProfile) return
    setCalorieGoal(String(nutritionProfile.calorie_goal))
    setProteinGoal(String(nutritionProfile.protein_goal))
    setCarbsGoal(String(nutritionProfile.carbs_goal))
    setFatGoal(String(nutritionProfile.fat_goal))
  }, [nutritionProfile])

  async function handleSignOut() {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('Sei sicuro di voler uscire?')
      : await new Promise(resolve => {
          Alert.alert('Esci', 'Vuoi uscire?', [
            { text: 'Annulla', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Esci', style: 'destructive', onPress: () => resolve(true) },
          ])
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
        <View style={styles.ornamentRow}>
          <View style={styles.line} /><Text style={styles.ornamentChar}>✦</Text><View style={styles.line} />
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.title}>PROFILO</Text>
          {isAdmin && (
            <TouchableOpacity style={styles.adminIconBtn} onPress={() => router.push('/admin')}>
              <Ionicons name="settings-outline" size={18} color={colors.accent} />
            </TouchableOpacity>
          )}
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
              ? <ActivityIndicator color={colors.bg} />
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
          <View style={styles.line} /><Text style={styles.ornamentChar}>✦</Text><View style={styles.line} />
        </View>
        <Text style={styles.version}>ASCENT v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { flexGrow: 1, padding: 24, gap: 24 },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ornamentBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  ornamentChar: { color: colors.accent, fontSize: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 8 },
  card: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 16, gap: 16 },
  cardAccent: { width: 2, backgroundColor: colors.accent },
  label: { fontSize: 9, color: colors.textMuted, letterSpacing: 3, marginBottom: 8 },
  value: { fontSize: 15, color: colors.text },
  section: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 10, color: colors.textMuted, fontWeight: '900', letterSpacing: 4 },
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  field: { flex: 1, minWidth: 130, gap: 6 },
  inputLabel: { fontSize: 8, color: colors.textMuted, fontWeight: '900', letterSpacing: 2 },
  input: { borderWidth: 1, borderColor: colors.border, color: colors.text, backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  saveBtn: { backgroundColor: colors.accent, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: colors.bg, fontSize: 11, fontWeight: '900', letterSpacing: 3 },
  adminIconBtn: { width: 40, height: 40, borderWidth: 1, borderColor: colors.accent, backgroundColor: colors.accentDim, alignItems: 'center', justifyContent: 'center' },
  signOutBtn: { borderWidth: 1, borderColor: colors.accent, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
  signOutBtnDisabled: { opacity: 0.5 },
  signOutText: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 4 },
  version: { textAlign: 'center', color: colors.textDim, fontSize: 9, letterSpacing: 3 },
})
