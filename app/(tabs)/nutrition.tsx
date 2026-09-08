import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { format, subDays } from 'date-fns'
import { it } from 'date-fns/locale'
import Svg, { Circle } from 'react-native-svg'
import { colors } from '../../constants/colors'
import { useCreateNutritionMeal, useDeleteNutritionMeal, useNutritionMeals, useNutritionProfile } from '../../hooks/useNutrition'
import { MealType, NutritionMeal } from '../../lib/types'

type ViewMode = 'today' | 'history'

type ImportedMeal = {
  date?: unknown
  meal_type?: unknown
  summary?: unknown
  calories?: unknown
  protein?: unknown
  carbs?: unknown
  fat?: unknown
  confidence?: unknown
  input_text?: unknown
}

const mealOptions: Array<{ key: MealType; label: string }> = [
  { key: 'colazione', label: 'COLAZIONE' },
  { key: 'pranzo', label: 'PRANZO' },
  { key: 'cena', label: 'CENA' },
  { key: 'spuntino', label: 'SPUNTINO' },
  { key: 'fuori_pasto', label: 'FUORI' },
]

const mealTypes = mealOptions.map(option => option.key)

const macroColors = {
  calories: colors.accent,
  protein: '#2f80ed',
  carbs: '#27ae60',
  fat: '#f2c94c',
}

const jsonPlaceholder = `{
  "summary": "riso, pollo, olio e verdure",
  "calories": 720,
  "protein": 45,
  "carbs": 85,
  "fat": 22,
  "confidence": 80
}`

const aiPromptTemplate = `A [colazione] ho mangiato [sei gocciole Pavesi e 200 ml di latte parzialmente scremato.] Fammi una stima delle KCAL e MACRO nel seguente formato json mettendoci una breve descrizione:
{
  "summary": string,
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "confidence": number
}`

function todayIso() {
  return format(new Date(), 'yyyy-MM-dd')
}

function totals(meals: NutritionMeal[]) {
  return meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )
}

function notify(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n${message}`)
  else Alert.alert(title, message)
}

function parseJsonInput(value: string) {
  const trimmed = value.trim()
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  const normalized = (fenced?.[1] ?? trimmed)
    .replace(/[“”„‟]/g, '"')
    .replace(/[‘’‚‛]/g, "'")
    .replace(/\u00a0/g, ' ')
  return JSON.parse(normalized)
}

function asNumber(value: unknown, field: string) {
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`Campo non valido: ${field}`)
  }
  return Math.round(number)
}

function normalizeImportedMeal(raw: ImportedMeal, selectedDate: string, selectedMealType: MealType) {
  const date = typeof raw.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.date)
    ? raw.date
    : selectedDate
  const summary = typeof raw.summary === 'string' && raw.summary.trim()
    ? raw.summary.trim()
    : 'Pasto importato'
  const confidence = raw.confidence === undefined || raw.confidence === null
    ? null
    : Math.min(Math.max(asNumber(raw.confidence, 'confidence'), 0), 100)

  return {
    date,
    meal_type: selectedMealType,
    input_text: typeof raw.input_text === 'string' && raw.input_text.trim() ? raw.input_text.trim() : summary,
    transcript: null,
    summary,
    calories: asNumber(raw.calories, 'calories'),
    protein: asNumber(raw.protein, 'protein'),
    carbs: asNumber(raw.carbs, 'carbs'),
    fat: asNumber(raw.fat, 'fat'),
    confidence,
    source: 'ai_import' as const,
  }
}

function ProgressRing({ label, value, goal, unit, color }: { label: string; value: number; goal: number; unit: string; color: string }) {
  const size = 112
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = goal > 0 ? Math.min(value / goal, 1.25) : 0
  const dash = `${circumference * Math.min(pct, 1)} ${circumference}`

  return (
    <View style={styles.ringWrap}>
      <Svg width={size} height={size} style={styles.ringSvg}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.border} strokeWidth={stroke} fill="transparent" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={dash}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringPct}>{Math.round((value / Math.max(goal, 1)) * 100)}%</Text>
        <Text style={styles.ringValue}>{Math.round(value)}{unit}</Text>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  )
}

function MealCard({ meal, onDelete }: { meal: NutritionMeal; onDelete: (id: string) => void }) {
  return (
    <View style={styles.mealCard}>
      <View style={styles.mealTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.mealType}>{meal.meal_type.replace('_', ' ').toUpperCase()}</Text>
          <Text style={styles.mealSummary} numberOfLines={1}>{meal.summary}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onDelete(meal.id)}>
          <Ionicons name="trash-outline" size={16} color={colors.accent} />
        </TouchableOpacity>
      </View>
      <View style={styles.macroRow}>
        <Text style={styles.kcal}>{Math.round(meal.calories)} kcal</Text>
        <Text style={styles.macroText}>P {Math.round(meal.protein)}g</Text>
        <Text style={styles.macroText}>C {Math.round(meal.carbs)}g</Text>
        <Text style={styles.macroText}>F {Math.round(meal.fat)}g</Text>
        {meal.confidence !== null && <Text style={styles.confidence}>{meal.confidence}%</Text>}
      </View>
    </View>
  )
}

export default function NutritionScreen() {
  const [mode, setMode] = useState<ViewMode>('today')
  const [selectedMealType, setSelectedMealType] = useState<MealType>('pranzo')
  const [jsonInput, setJsonInput] = useState('')
  const currentDate = todayIso()
  const from = format(subDays(new Date(), 30), 'yyyy-MM-dd')

  const { data: profile } = useNutritionProfile()
  const { data: meals = [], isLoading } = useNutritionMeals(from)
  const createMeal = useCreateNutritionMeal()
  const deleteMeal = useDeleteNutritionMeal()

  const todaysMeals = useMemo(() => meals.filter(meal => meal.date === currentDate), [meals, currentDate])
  const todayTotals = useMemo(() => totals(todaysMeals), [todaysMeals])
  const groupedHistory = useMemo(() => {
    const byDate: Record<string, NutritionMeal[]> = {}
    meals
      .filter(meal => meal.date !== currentDate)
      .forEach(meal => {
        if (!byDate[meal.date]) byDate[meal.date] = []
        byDate[meal.date].push(meal)
      })
    return Object.entries(byDate).sort(([a], [b]) => b.localeCompare(a))
  }, [meals, currentDate])

  async function importMeal() {
    try {
      const parsed = parseJsonInput(jsonInput)
      const firstMeal = Array.isArray(parsed) ? parsed[0] : parsed
      if (!firstMeal || typeof firstMeal !== 'object') {
        throw new Error('Incolla un JSON oggetto valido')
      }

      await createMeal.mutateAsync(normalizeImportedMeal(firstMeal as ImportedMeal, currentDate, selectedMealType))
      setJsonInput('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'JSON non valido'
      notify('Import non riuscito', message)
    }
  }

  async function copyTemplate() {
    try {
      if (Platform.OS !== 'web' || !navigator?.clipboard) {
        notify('Clipboard non disponibile', 'La copia automatica è disponibile nel browser.')
        return
      }

      await navigator.clipboard.writeText(aiPromptTemplate)
      notify('Template copiato', 'Ora puoi incollarlo nella chat AI.')
    } catch {
      notify('Copia non riuscita', 'Il browser non ha permesso l’accesso alla clipboard.')
    }
  }

  const busy = createMeal.isPending
  const calorieGoal = profile?.calorie_goal ?? 2000
  const proteinGoal = profile?.protein_goal ?? 120
  const carbsGoal = profile?.carbs_goal ?? 250
  const fatGoal = profile?.fat_goal ?? 55

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.headerWrap}>
          <View style={styles.ornamentRow}>
            <View style={styles.line} /><Text style={styles.ornamentChar}>✦</Text><View style={styles.line} />
          </View>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>NUTRITION</Text>
              <Text style={styles.dateText}>{format(new Date(), 'EEEE d MMMM', { locale: it })}</Text>
            </View>
            <View style={styles.modeTabs}>
              {(['today', 'history'] as ViewMode[]).map(tab => (
                <TouchableOpacity key={tab} style={[styles.modeTab, mode === tab && styles.modeTabActive]} onPress={() => setMode(tab)}>
                  <Text style={[styles.modeTabText, mode === tab && styles.modeTabTextActive]}>{tab === 'today' ? 'OGGI' : 'STORICO'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {mode === 'today' && (
          <>
            <View style={styles.ringGrid}>
              <ProgressRing label="KCAL" value={todayTotals.calories} goal={calorieGoal} unit="" color={macroColors.calories} />
              <ProgressRing label="PRO" value={todayTotals.protein} goal={proteinGoal} unit="g" color={macroColors.protein} />
              <ProgressRing label="CARBO" value={todayTotals.carbs} goal={carbsGoal} unit="g" color={macroColors.carbs} />
              <ProgressRing label="GRASSI" value={todayTotals.fat} goal={fatGoal} unit="g" color={macroColors.fat} />
            </View>

            <View style={styles.composer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mealTypeRow}>
                {mealOptions.map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.mealTypeBtn, selectedMealType === option.key && styles.mealTypeBtnActive]}
                    onPress={() => setSelectedMealType(option.key)}
                  >
                    <Text style={[styles.mealTypeBtnText, selectedMealType === option.key && styles.mealTypeBtnTextActive]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput
                style={styles.messageInput}
                value={jsonInput}
                onChangeText={setJsonInput}
                multiline
                autoCapitalize="none"
                autoCorrect={false}
                placeholder={jsonPlaceholder}
                placeholderTextColor={colors.textDim}
              />

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.templateBtn} onPress={copyTemplate}>
                  <Ionicons name="copy-outline" size={17} color={colors.accent} />
                  <Text style={styles.templateBtnText}>COPIA PROMPT</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.importBtn, (!jsonInput.trim() || busy) && styles.disabled]}
                  onPress={importMeal}
                  disabled={!jsonInput.trim() || busy}
                >
                  {busy ? <ActivityIndicator color={colors.bg} /> : <Ionicons name="save" size={18} color={colors.bg} />}
                  <Text style={styles.importBtnText}>SALVA</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>PASTI DI OGGI</Text>
            </View>
            {isLoading ? (
              <ActivityIndicator color={colors.accent} />
            ) : todaysMeals.length === 0 ? (
              <Text style={styles.empty}>Nessun pasto inserito oggi</Text>
            ) : (
              todaysMeals.map(meal => <MealCard key={meal.id} meal={meal} onDelete={deleteMeal.mutate} />)
            )}
          </>
        )}

        {mode === 'history' && (
          <View style={styles.historyWrap}>
            {groupedHistory.length === 0 ? (
              <Text style={styles.empty}>Nessuno storico nutrition</Text>
            ) : groupedHistory.map(([date, dateMeals]) => {
              const dayTotals = totals(dateMeals)
              return (
                <View key={date} style={styles.dayBlock}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayDate}>{format(new Date(date), 'dd MMM yyyy', { locale: it }).toUpperCase()}</Text>
                    <Text style={styles.dayKcal}>{Math.round(dayTotals.calories)} / {calorieGoal} kcal</Text>
                  </View>
                  {dateMeals.map(meal => <MealCard key={meal.id} meal={meal} onDelete={deleteMeal.mutate} />)}
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 16 },
  headerWrap: { gap: 10 },
  ornamentRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  ornamentChar: { color: colors.accent, fontSize: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: 5 },
  dateText: { fontSize: 10, color: colors.textMuted, letterSpacing: 2, textTransform: 'capitalize', marginTop: 4 },
  modeTabs: { flexDirection: 'row', borderWidth: 1, borderColor: colors.border },
  modeTab: { paddingHorizontal: 10, paddingVertical: 8, minWidth: 64, alignItems: 'center' },
  modeTabActive: { backgroundColor: colors.accentDim },
  modeTabText: { fontSize: 9, color: colors.textMuted, fontWeight: '900', letterSpacing: 1 },
  modeTabTextActive: { color: colors.accent },
  ringGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ringWrap: { width: '48%', minWidth: 146, alignItems: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingVertical: 14, gap: 8 },
  ringSvg: { transform: [{ rotate: '0deg' }] },
  ringCenter: { position: 'absolute', top: 42, alignItems: 'center', width: 112 },
  ringPct: { color: colors.text, fontSize: 20, fontWeight: '900' },
  ringValue: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  ringLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  composer: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 14, gap: 12 },
  mealTypeRow: { gap: 8 },
  mealTypeBtn: { height: 30, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  mealTypeBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  mealTypeBtnText: { fontSize: 8, fontWeight: '900', letterSpacing: 1, color: colors.textMuted },
  mealTypeBtnTextActive: { color: colors.bg },
  messageInput: { minHeight: 154, maxHeight: 260, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, color: colors.text, padding: 12, fontSize: 13, lineHeight: 18, textAlignVertical: 'top', fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },
  actionRow: { flexDirection: 'row', gap: 10 },
  templateBtn: { flex: 1, minHeight: 44, borderWidth: 1, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  templateBtnText: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  importBtn: { minHeight: 44, minWidth: 110, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 14 },
  importBtnText: { color: colors.bg, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  disabled: { opacity: 0.5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  sectionDot: { width: 5, height: 5, backgroundColor: colors.accent, transform: [{ rotate: '45deg' }] },
  sectionTitle: { fontSize: 10, color: colors.textMuted, letterSpacing: 4, fontWeight: '900' },
  mealCard: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 14, gap: 10 },
  mealTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  mealType: { fontSize: 8, color: colors.accent, fontWeight: '900', letterSpacing: 2, marginBottom: 5 },
  mealSummary: { color: colors.text, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  macroRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  kcal: { color: colors.text, fontSize: 12, fontWeight: '900' },
  macroText: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  confidence: { color: colors.textDim, fontSize: 10, marginLeft: 'auto' },
  originalText: { color: colors.textDim, fontSize: 11, lineHeight: 16 },
  empty: { color: colors.textMuted, textAlign: 'center', marginVertical: 24, letterSpacing: 1 },
  historyWrap: { gap: 18 },
  dayBlock: { gap: 8 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  dayDate: { color: colors.text, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  dayKcal: { color: colors.accent, fontSize: 11, fontWeight: '900' },
})
