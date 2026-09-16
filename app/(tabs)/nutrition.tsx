import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { addDays, format, subDays } from 'date-fns'
import { it } from 'date-fns/locale'
import Svg, { Circle } from 'react-native-svg'
import { colors } from '../../constants/colors'
import { ToastHost, useToast } from '../../components/Toast'
import { useCreateNutritionMeal, useDeleteNutritionMeal, useNutritionMeals, useNutritionProfile } from '../../hooks/useNutrition'
import { MealType, NutritionMeal } from '../../lib/types'

type ViewMode = 'today' | 'history' | 'day'

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

function isValidIsoDate(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  return !Number.isNaN(new Date(`${date}T00:00:00`).getTime())
}

function shiftIsoDate(date: string, days: number) {
  if (!isValidIsoDate(date)) return todayIso()
  const shifted = format(addDays(new Date(`${date}T00:00:00`), days), 'yyyy-MM-dd')
  return shifted > todayIso() ? todayIso() : shifted
}

function shortDateLabel(date: string) {
  return isValidIsoDate(date) ? format(new Date(`${date}T00:00:00`), 'dd/MM') : date
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
  const size = 84
  const stroke = 6
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

function DateSelector({ date, onChange }: { date: string; onChange: (date: string) => void }) {
  const isFutureOrToday = date >= todayIso()

  return (
    <View style={styles.dateSelector}>
      <TouchableOpacity style={styles.dateArrowBtn} onPress={() => onChange(shiftIsoDate(date, -1))}>
        <Ionicons name="chevron-back" size={18} color={colors.accent} />
      </TouchableOpacity>
      <TextInput
        style={styles.dateInput}
        value={date}
        onChangeText={value => onChange(value > todayIso() ? todayIso() : value)}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.textDim}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TouchableOpacity style={styles.dateTodayBtn} onPress={() => onChange(todayIso())}>
        <Text style={styles.dateTodayText}>OGGI</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.dateArrowBtn, isFutureOrToday && styles.disabled]}
        onPress={() => onChange(shiftIsoDate(date, 1))}
        disabled={isFutureOrToday}
      >
        <Ionicons name="chevron-forward" size={18} color={colors.accent} />
      </TouchableOpacity>
    </View>
  )
}

function MealCard({ meal, onDelete, onPress }: { meal: NutritionMeal; onDelete: (id: string) => void; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.mealCard} onPress={onPress} activeOpacity={onPress ? 0.75 : 1}>
      <View style={styles.mealTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.mealType}>{meal.meal_type.replace('_', ' ').toUpperCase()}</Text>
          <Text style={styles.mealSummary} numberOfLines={1}>{meal.summary}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => onDelete(meal.id)}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
      <View style={styles.macroRow}>
        <Text style={styles.kcal}>{Math.round(meal.calories)} kcal</Text>
        <Text style={styles.macroText}>P {Math.round(meal.protein)}g</Text>
        <Text style={styles.macroText}>C {Math.round(meal.carbs)}g</Text>
        <Text style={styles.macroText}>F {Math.round(meal.fat)}g</Text>
        {meal.confidence !== null && <Text style={styles.confidence}>{meal.confidence}%</Text>}
      </View>
    </TouchableOpacity>
  )
}

export default function NutritionScreen() {
  const [mode, setMode] = useState<ViewMode>('today')
  const [selectedMealType, setSelectedMealType] = useState<MealType>('pranzo')
  const [selectedEntryDate, setSelectedEntryDate] = useState(todayIso())
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null)
  const [jsonInput, setJsonInput] = useState('')
  const [pendingMeal, setPendingMeal] = useState<ReturnType<typeof normalizeImportedMeal> | null>(null)
  const { toast, showToast } = useToast(2200)
  const lastClipboardTextRef = useRef('')
  const currentDate = todayIso()
  const from = format(subDays(new Date(), 30), 'yyyy-MM-dd')

  const { data: profile } = useNutritionProfile()
  const { data: meals = [], isLoading } = useNutritionMeals(from)
  const createMeal = useCreateNutritionMeal()
  const deleteMeal = useDeleteNutritionMeal()

  const selectedDayMeals = useMemo(() => meals.filter(meal => meal.date === selectedEntryDate), [meals, selectedEntryDate])
  const selectedDayTotals = useMemo(() => totals(selectedDayMeals), [selectedDayMeals])
  const historyDetailMeals = useMemo(
    () => selectedHistoryDate ? meals.filter(meal => meal.date === selectedHistoryDate) : [],
    [meals, selectedHistoryDate]
  )
  const historyDetailTotals = useMemo(() => totals(historyDetailMeals), [historyDetailMeals])
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
      if (!isValidIsoDate(selectedEntryDate)) {
        throw new Error('Inserisci una data valida nel formato YYYY-MM-DD')
      }
      if (selectedEntryDate > currentDate) {
        throw new Error('Non puoi inserire pasti nel futuro')
      }
      const parsed = parseJsonInput(jsonInput)
      const firstMeal = Array.isArray(parsed) ? parsed[0] : parsed
      if (!firstMeal || typeof firstMeal !== 'object') {
        throw new Error('Incolla un JSON oggetto valido')
      }

      await createMeal.mutateAsync(normalizeImportedMeal(firstMeal as ImportedMeal, selectedEntryDate, selectedMealType))
      setJsonInput('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'JSON non valido'
      notify('Import non riuscito', message)
    }
  }

  async function savePendingMeal() {
    if (!pendingMeal) return
    try {
      await createMeal.mutateAsync(pendingMeal)
      setPendingMeal(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Non sono riuscito a salvare il pasto'
      notify('Salvataggio non riuscito', message)
    }
  }

  async function readClipboardForMeal(force = false, showErrors = false) {
    if (Platform.OS !== 'web' || mode !== 'today') return
    if (!navigator?.clipboard?.readText) {
      if (showErrors) notify('Clipboard non disponibile', 'Il browser non permette la lettura automatica degli appunti.')
      return
    }

    try {
      const clipboardText = await navigator.clipboard.readText()
      if (!clipboardText.trim()) return
      if (!force && clipboardText === lastClipboardTextRef.current) return
      if (!isValidIsoDate(selectedEntryDate)) {
        throw new Error('Inserisci una data valida nel formato YYYY-MM-DD')
      }
      if (selectedEntryDate > currentDate) {
        throw new Error('Non puoi inserire pasti nel futuro')
      }

      const parsed = parseJsonInput(clipboardText)
      const firstMeal = Array.isArray(parsed) ? parsed[0] : parsed
      if (!firstMeal || typeof firstMeal !== 'object') {
        throw new Error('Il contenuto copiato non è un JSON oggetto valido')
      }

      const meal = normalizeImportedMeal(firstMeal as ImportedMeal, selectedEntryDate, selectedMealType)
      lastClipboardTextRef.current = clipboardText
      setPendingMeal(meal)
    } catch (error) {
      if (showErrors) {
        const message = error instanceof Error ? error.message : 'JSON non valido'
        notify('Clipboard non importabile', message)
      }
    }
  }

  async function copyTemplate() {
    try {
      if (Platform.OS !== 'web' || !navigator?.clipboard) {
        notify('Clipboard non disponibile', 'La copia automatica è disponibile nel browser.')
        return
      }

      await navigator.clipboard.writeText(aiPromptTemplate)
      showToast('Template copiato', 'success')
    } catch {
      notify('Copia non riuscita', 'Il browser non ha permesso l’accesso alla clipboard.')
    }
  }

  useEffect(() => {
    if (Platform.OS !== 'web' || mode !== 'today') return

    const checkClipboard = () => {
      void readClipboardForMeal(false, false)
    }
    const checkClipboardWhenVisible = () => {
      if (document.visibilityState === 'visible') checkClipboard()
    }

    checkClipboard()
    window.addEventListener('focus', checkClipboard)
    document.addEventListener('visibilitychange', checkClipboardWhenVisible)
    return () => {
      window.removeEventListener('focus', checkClipboard)
      document.removeEventListener('visibilitychange', checkClipboardWhenVisible)
    }
  }, [mode, selectedMealType, selectedEntryDate])

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
                <TouchableOpacity
                  key={tab}
                  style={[styles.modeTab, (mode === tab || (tab === 'history' && mode === 'day')) && styles.modeTabActive]}
                  onPress={() => {
                    setMode(tab)
                    if (tab === 'history') setSelectedHistoryDate(null)
                  }}
                >
                  <Text style={[styles.modeTabText, (mode === tab || (tab === 'history' && mode === 'day')) && styles.modeTabTextActive]}>{tab === 'today' ? 'OGGI' : 'STORICO'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {mode === 'today' && (
          <>
            <View style={styles.ringGrid}>
              <ProgressRing label="KCAL" value={selectedDayTotals.calories} goal={calorieGoal} unit="kcal" color={macroColors.calories} />
              <ProgressRing label="PRO" value={selectedDayTotals.protein} goal={proteinGoal} unit="g" color={macroColors.protein} />
              <ProgressRing label="CARBO" value={selectedDayTotals.carbs} goal={carbsGoal} unit="g" color={macroColors.carbs} />
              <ProgressRing label="GRASSI" value={selectedDayTotals.fat} goal={fatGoal} unit="g" color={macroColors.fat} />
            </View>

            <View style={styles.composer}>
              <DateSelector date={selectedEntryDate} onChange={setSelectedEntryDate} />

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
                  {busy ? <ActivityIndicator color={colors.text} /> : <Ionicons name="save" size={18} color={colors.text} />}
                  <Text style={styles.importBtnText}>SALVA</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>
                {selectedEntryDate === currentDate ? 'PASTI DI OGGI' : `PASTI DEL ${shortDateLabel(selectedEntryDate)}`}
              </Text>
            </View>
            {isLoading ? (
              <ActivityIndicator color={colors.accent} />
            ) : selectedDayMeals.length === 0 ? (
              <Text style={styles.empty}>Nessun pasto inserito per questa data</Text>
            ) : (
              selectedDayMeals.map(meal => <MealCard key={meal.id} meal={meal} onDelete={deleteMeal.mutate} />)
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
                  {dateMeals.map(meal => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onDelete={deleteMeal.mutate}
                      onPress={() => {
                        setSelectedHistoryDate(date)
                        setMode('day')
                      }}
                    />
                  ))}
                </View>
              )
            })}
          </View>
        )}

        {mode === 'day' && selectedHistoryDate && (
          <>
            <TouchableOpacity style={styles.backToHistoryBtn} onPress={() => setMode('history')}>
              <Ionicons name="chevron-back" size={18} color={colors.accent} />
              <Text style={styles.backToHistoryText}>STORICO</Text>
            </TouchableOpacity>
            <View style={styles.dayDetailHeader}>
              <Text style={styles.dayDetailTitle}>{format(new Date(`${selectedHistoryDate}T00:00:00`), 'EEEE d MMMM yyyy', { locale: it })}</Text>
              <Text style={styles.dayKcal}>{Math.round(historyDetailTotals.calories)} / {calorieGoal} kcal</Text>
            </View>
            <View style={styles.ringGrid}>
              <ProgressRing label="KCAL" value={historyDetailTotals.calories} goal={calorieGoal} unit="" color={macroColors.calories} />
              <ProgressRing label="PRO" value={historyDetailTotals.protein} goal={proteinGoal} unit="g" color={macroColors.protein} />
              <ProgressRing label="CARBO" value={historyDetailTotals.carbs} goal={carbsGoal} unit="g" color={macroColors.carbs} />
              <ProgressRing label="GRASSI" value={historyDetailTotals.fat} goal={fatGoal} unit="g" color={macroColors.fat} />
            </View>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>PASTI DEL GIORNO</Text>
            </View>
            {historyDetailMeals.map(meal => <MealCard key={meal.id} meal={meal} onDelete={deleteMeal.mutate} />)}
          </>
        )}
      </ScrollView>

      <Modal visible={!!pendingMeal} transparent animationType="fade" onRequestClose={() => setPendingMeal(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmModal}>
            <View style={styles.modalHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.modalTitle}>JSON COPIATO</Text>
            </View>
            {pendingMeal && (
              <>
                <Text style={styles.modalMealType}>{pendingMeal.meal_type.replace('_', ' ').toUpperCase()}</Text>
                <Text style={styles.modalSummary}>{pendingMeal.summary}</Text>
                <View style={styles.modalMacros}>
                  <Text style={styles.kcal}>{pendingMeal.calories} kcal</Text>
                  <Text style={styles.macroText}>P {pendingMeal.protein}g</Text>
                  <Text style={styles.macroText}>C {pendingMeal.carbs}g</Text>
                  <Text style={styles.macroText}>F {pendingMeal.fat}g</Text>
                  {pendingMeal.confidence !== null && <Text style={styles.confidence}>{pendingMeal.confidence}%</Text>}
                </View>
              </>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPendingMeal(null)}>
                <Text style={styles.cancelBtnText}>ANNULLA</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, busy && styles.disabled]} onPress={savePendingMeal} disabled={busy}>
                {busy ? <ActivityIndicator color={colors.text} /> : <Ionicons name="save" size={17} color={colors.text} />}
                <Text style={styles.confirmBtnText}>SALVA</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ToastHost toast={toast} bottom={72} />
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
  ringWrap: { width: '48%', minWidth: 116, alignItems: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingVertical: 10, gap: 6 },
  ringSvg: { transform: [{ rotate: '0deg' }] },
  ringCenter: { position: 'absolute', top: 30, alignItems: 'center', width: 84 },
  ringPct: { color: colors.text, fontSize: 16, fontWeight: '900' },
  ringValue: { color: colors.textMuted, fontSize: 9, marginTop: 1 },
  ringLabel: { color: colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 2 },
  composer: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 14, gap: 12 },
  dateSelector: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dateArrowBtn: { width: 36, height: 36, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  dateInput: { flex: 1, height: 36, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, color: colors.text, paddingHorizontal: 10, fontSize: 13, fontWeight: '700' },
  dateTodayBtn: { height: 36, borderWidth: 1, borderColor: colors.accent, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentDim },
  dateTodayText: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  mealTypeRow: { gap: 8 },
  mealTypeBtn: { height: 30, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  mealTypeBtnActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  mealTypeBtnText: { fontSize: 8, fontWeight: '900', letterSpacing: 1, color: colors.textMuted },
  mealTypeBtnTextActive: { color: colors.accent },
  messageInput: { minHeight: 154, maxHeight: 260, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, color: colors.text, padding: 12, fontSize: 13, lineHeight: 18, textAlignVertical: 'top', fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },
  actionRow: { flexDirection: 'row', gap: 10 },
  templateBtn: { flex: 1, minHeight: 44, borderWidth: 1, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  templateBtnText: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  readClipboardBtn: { minHeight: 44, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, paddingHorizontal: 10 },
  readClipboardText: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  importBtn: { minHeight: 44, minWidth: 110, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 14 },
  importBtnText: { color: colors.text, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
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
  backToHistoryBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 8 },
  backToHistoryText: { color: colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  dayDetailHeader: { gap: 6 },
  dayDetailTitle: { color: colors.text, fontSize: 20, fontWeight: '900', letterSpacing: 1, textTransform: 'capitalize' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  confirmModal: { width: '100%', maxWidth: 420, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 18, gap: 14 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalTitle: { color: colors.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 3 },
  modalMealType: { color: colors.accent, fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  modalSummary: { color: colors.text, fontSize: 16, fontWeight: '700', lineHeight: 22 },
  modalMacros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 2 },
  cancelBtn: { flex: 1, minHeight: 42, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: colors.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  confirmBtn: { flex: 1, minHeight: 42, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  confirmBtnText: { color: colors.text, fontSize: 10, fontWeight: '900', letterSpacing: 2 },
})
