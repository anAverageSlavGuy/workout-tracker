import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  useSession,
  useAddSet,
  useUpdateSet,
  useDeleteSet,
  useDeleteSession,
  useUpdateSessionDate,
} from "../../hooks/useSessions";
import { useSwipeBack } from "../../hooks/useSwipeBack";
import { ExercisePicker } from "../../components/ExercisePicker";
import { SetRow } from "../../components/SetRow";
import { MuscleActivationBadges } from "../../components/MuscleActivationBadges";
import { useConfirmModal } from "../../components/ConfirmModal";
import { Exercise, SessionSet } from "../../lib/types";
import { colors } from "../../constants/colors";
import { useOfflineWorkout } from "../../hooks/useOfflineWorkout";

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: session, isLoading } = useSession(id);
  const offline = useOfflineWorkout(id);
  const isOffline = offline.isOfflineMode;

  const swipeBackHandler = useSwipeBack({
    onSwipe: () => handleBack(),
  });
  const addSet = useAddSet();
  const updateSet = useUpdateSet();
  const deleteSet = useDeleteSet();
  const deleteSession = useDeleteSession();
  const updateSessionDate = useUpdateSessionDate();
  const { confirm, confirmModal } = useConfirmModal();

  const [showPicker, setShowPicker] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dateInput, setDateInput] = useState("");
  // Stato separato per ogni esercizio: { weight, reps }
  const [inputs, setInputs] = useState<
    Record<string, { weight: string; reps: string }>
  >({});

  function getInput(exerciseId: string) {
    return inputs[exerciseId] ?? { weight: "", reps: "" };
  }

  function setInput(
    exerciseId: string,
    field: "weight" | "reps",
    value: string,
  ) {
    setInputs((prev) => ({
      ...prev,
      [exerciseId]: {
        ...(prev[exerciseId] ?? { weight: "", reps: "" }),
        [field]: value,
      },
    }));
  }

  function clearInput(exerciseId: string) {
    setInputs((prev) => ({ ...prev, [exerciseId]: { weight: "", reps: "" } }));
  }

  const setsByExercise = useMemo(() => {
    const compareSets = (a: SessionSet, b: SessionSet) => {
      if (a.set_number !== b.set_number) return a.set_number - b.set_number;
      const aCreatedAt = a.created_at ?? "";
      const bCreatedAt = b.created_at ?? "";
      if (aCreatedAt !== bCreatedAt)
        return aCreatedAt.localeCompare(bCreatedAt);
      return a.id.localeCompare(b.id);
    };

    const map = new Map<string, { exercise: Exercise; sets: SessionSet[] }>();
    const orderedSets = [...(session?.session_sets ?? [])].sort(compareSets);

    for (const s of orderedSets) {
      if (!s.exercises) continue;
      const group = map.get(s.exercise_id);
      if (group) {
        group.sets.push(s);
      } else {
        map.set(s.exercise_id, { exercise: s.exercises, sets: [s] });
      }
    }

    const result = Array.from(map.values());
    result.forEach((group) => {
      group.sets.sort(compareSets);
    });
    return result;
  }, [session]);

  async function handleBack() {
    const goBack = () => router.replace("/(tabs)");

    if ((session?.session_sets?.length ?? 0) > 0) {
      const confirmed = await confirm({
        title: "ESCI",
        message: "Vuoi uscire? I dati sono già salvati.",
        confirmLabel: "ESCI",
      });
      if (confirmed) goBack();
    } else {
      goBack();
    }
  }

  async function handleAddExercise(exercise: Exercise) {
    // Aggiunge l'esercizio con un set placeholder (peso 0, rep dalle input o default 10)
    const maxSetNumber = Math.max(
      0,
      ...(session?.session_sets?.map((s) => s.set_number) ?? []),
    );
    const { weight, reps } = getInput(exercise.id);
    if (isOffline) {
      await offline.addExercise(exercise, { weight: parseFloat(weight) || 0, reps: parseInt(reps, 10) || 10 }, maxSetNumber + 1);
    } else {
      await addSet.mutateAsync({
        session_id: id,
        exercise_id: exercise.id,
        set_number: maxSetNumber + 1,
        weight: parseFloat(weight) || 0,
        reps: parseInt(reps, 10) || 10,
      });
    }
  }

  async function handleAddSet(exercise: Exercise) {
    const maxSetNumber = Math.max(
      0,
      ...(session?.session_sets?.map((s) => s.set_number) ?? []),
    );
    const group = setsByExercise.find((g) => g.exercise.id === exercise.id);
    const lastSet = group?.sets.at(-1);
    const { weight, reps } = getInput(exercise.id);

    // Usa il valore digitato; se vuoto, ripropone l'ultimo set
    const w =
      weight.trim() !== "" ? parseFloat(weight) : (lastSet?.weight ?? 0);
    const r = reps.trim() !== "" ? parseInt(reps, 10) : (lastSet?.reps ?? 10);

    if (isNaN(w) || isNaN(r) || r <= 0) return;

    if (isOffline) {
      await offline.addSet({ session_id: id, exercise_id: exercise.id, set_number: maxSetNumber + 1, weight: w, reps: r, rpe: null, set_type: null });
    } else {
      await addSet.mutateAsync({
        session_id: id,
        exercise_id: exercise.id,
        set_number: maxSetNumber + 1,
        weight: w,
        reps: r,
      });
    }
    clearInput(exercise.id);
  }

  async function handleDeleteSession() {
    const confirmed = await confirm({
      title: "ELIMINA ALLENAMENTO",
      message: "Sei sicuro di voler eliminare questo allenamento?",
      confirmLabel: "ELIMINA",
      danger: true,
    });

    if (confirmed) {
      await deleteSession.mutateAsync(id);
      router.replace("/(tabs)");
    }
  }

  function startEditingDate() {
    setDateInput(session?.date ?? "");
    setIsEditingDate(true);
  }

  function formatDateInput(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  }

  async function handleUpdateDate() {
    const nextDate = dateInput.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nextDate)) {
      Alert.alert(
        "Data non valida",
        "Inserisci la data nel formato YYYY-MM-DD.",
      );
      return;
    }

    const parsed = new Date(`${nextDate}T00:00:00`);
    if (
      Number.isNaN(parsed.getTime()) ||
      format(parsed, "yyyy-MM-dd") !== nextDate
    ) {
      Alert.alert("Data non valida", "Controlla giorno, mese e anno.");
      return;
    }

    if (isOffline) await offline.updateDate(nextDate);
    else await updateSessionDate.mutateAsync({ id, date: nextDate });
    setIsEditingDate(false);
  }

  if (isLoading || !session) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.safe} {...swipeBackHandler.panHandlers}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          onLongPress={() => {
            if (Platform.OS === "web") window.history.back();
          }}
        >
          <Text style={styles.backChar}>↓</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>ALLENAMENTO</Text>
          <Text style={styles.headerDate}>
            {format(new Date(session.date), "EEEE d MMMM", { locale: it })}
          </Text>
        </View>
      </View>
      <View style={styles.headerDivider} />
      {/* {Platform.OS === "web" && (
        <View
          style={{
            padding: 8,
            backgroundColor: colors.accentDim,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: colors.accent,
              textAlign: "center",
              letterSpacing: 1,
            }}
          >
            Tieni premuto ↓ per tornare o usa il bottone back del browser
          </Text>
        </View>
      )} */}
      {(isOffline || offline.pendingCount > 0) && (
        <View style={styles.offlineBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.offlineTitle}>
              {isOffline ? "MODALITÀ OFFLINE" : "MODIFICHE DA SINCRONIZZARE"}
            </Text>
            <Text style={styles.offlineText}>
              {offline.pendingCount > 0
                ? `${offline.pendingCount} operazion${offline.pendingCount === 1 ? "e" : "i"} in attesa`
                : "I set vengono salvati sul dispositivo"}
            </Text>
          </View>
        </View>
      )}
      {offline.syncError && <Text style={styles.syncError}>{offline.syncError}</Text>}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {setsByExercise.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyOrnament}>✦</Text>
            <Text style={styles.emptyTitle}>NESSUN ESERCIZIO</Text>
            <Text style={styles.emptyText}>
              Aggiungi il primo esercizio per iniziare
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => setShowPicker(true)}
            >
              <Text style={styles.emptyBtnText}>+ AGGIUNGI ESERCIZIO</Text>
            </TouchableOpacity>
          </View>
        )}

        {setsByExercise.map(({ exercise, sets }) => (
          <View key={exercise.id} style={styles.exerciseGroup}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exAccentBar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.exerciseName}>
                  {exercise.name.toUpperCase()}
                  {exercise.equipment_types && (
                    <Text style={styles.equipment}>
                      {'  '}
                      {exercise.equipment_types.name}
                    </Text>
                  )}
                </Text>
                <View style={{ marginTop: 6 }}>
                  <MuscleActivationBadges exercise={exercise} size="small" />
                </View>
              </View>
              <Text style={styles.setCount}>{sets.length} SET</Text>
            </View>

            <View style={styles.setHeaders}>
              <Text style={[styles.setHeaderText, { width: 30 }]}>#</Text>
              <Text style={[styles.setHeaderText, { flex: 1 }]}>
                PESO × REPS
              </Text>
            </View>

            {sets.map((s) => (
              <SetRow
                key={s.id}
                set={s}
                onDelete={() => isOffline ? offline.deleteSet({ id: s.id }) : deleteSet.mutate({ id: s.id, session_id: id })}
                onUpdate={(w, r, rpe, setType) => isOffline
                  ? offline.updateSet({ id: s.id, weight: w, reps: r, rpe, set_type: setType })
                  : updateSet.mutate({ id: s.id, session_id: id, weight: w, reps: r, rpe, set_type: setType })}
              />
            ))}

            <View style={styles.addSetRow}>
              <TextInput
                style={styles.addSetInput}
                placeholder={sets.at(-1)?.weight.toString() ?? "0"}
                placeholderTextColor={colors.textDim}
                keyboardType="decimal-pad"
                value={getInput(exercise.id).weight}
                onChangeText={(v) => setInput(exercise.id, "weight", v)}
              />
              <Text style={styles.addSetUnit}>kg</Text>
              <Text style={styles.addSetCross}>×</Text>
              <TextInput
                style={styles.addSetInput}
                placeholder={sets.at(-1)?.reps.toString() ?? "10"}
                placeholderTextColor={colors.textDim}
                keyboardType="number-pad"
                value={getInput(exercise.id).reps}
                onChangeText={(v) => setInput(exercise.id, "reps", v)}
              />
              <Text style={styles.addSetUnit}>rep</Text>
              <TouchableOpacity
                style={styles.addSetBtn}
                onPress={() => handleAddSet(exercise)}
                disabled={addSet.isPending || offline.isSyncing}
              >
                {addSet.isPending ? (
                  <ActivityIndicator color={colors.text} size="small" />
                ) : (
                  <Text style={styles.addSetBtnText}>+ SET</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {showFabMenu && (
        <Pressable
          accessibilityLabel="Chiudi menu azioni"
          onPress={() => setShowFabMenu(false)}
          style={styles.fabBackdrop}
        />
      )}
      {showFabMenu && (
        <View style={styles.fabMenu}>
          <TouchableOpacity
            style={styles.fabAction}
            onPress={() => { offline.setIsOfflineMode(!isOffline); setShowFabMenu(false); }}
          >
            <Text style={styles.fabActionLabel}>{isOffline ? "USA ONLINE" : "USA OFFLINE"}</Text>
            <View style={styles.fabActionIcon}>
              <Ionicons name={isOffline ? "wifi-outline" : "cloud-offline-outline"} size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabAction}
            onPress={() => { setShowPicker(true); setShowFabMenu(false); }}
          >
            <Text style={styles.fabActionLabel}>AGGIUNGI ESERCIZIO</Text>
            <View style={styles.fabActionIcon}>
              <Ionicons name="add" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabAction}
            onPress={() => { startEditingDate(); setShowFabMenu(false); }}
            disabled={updateSessionDate.isPending}
          >
            <Text style={styles.fabActionLabel}>CAMBIA DATA</Text>
            <View style={styles.fabActionIcon}>
              <Ionicons name="calendar-outline" size={17} color="#fff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabAction}
            onPress={() => { handleDeleteSession(); setShowFabMenu(false); }}
            disabled={deleteSession.isPending}
          >
            <Text style={[styles.fabActionLabel, { color: colors.danger }]}>ELIMINA ALLENAMENTO</Text>
            <View style={[styles.fabActionIcon, styles.fabDangerIcon]}>
              <Ionicons name="trash-outline" size={17} color="#fff" />
            </View>
          </TouchableOpacity>
          {offline.pendingCount > 0 && (
            <TouchableOpacity
              style={styles.fabAction}
              onPress={() => offline.sync().catch(() => undefined)}
              disabled={offline.isSyncing}
            >
              <Text style={styles.fabActionLabel}>SINCRONIZZA ({offline.pendingCount})</Text>
              <View style={styles.fabActionIcon}>
                {offline.isSyncing ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="sync-outline" size={18} color="#fff" />}
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}
      <View style={styles.fabWrap}>
        <TouchableOpacity
          accessibilityLabel={showFabMenu ? "Chiudi azioni allenamento" : `Apri azioni allenamento, modalità ${isOffline ? "offline" : "online"}`}
          onPress={() => setShowFabMenu(value => !value)}
          style={[styles.fab, isOffline && styles.fabOffline]}
        >
          <Ionicons
            name={isOffline ? "cloud-offline-outline" : "wifi-outline"}
            size={24}
            color={isOffline ? colors.accent : '#fff'}
          />
        </TouchableOpacity>
      </View>

      <ExercisePicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleAddExercise}
      />
      <Modal
        visible={isEditingDate}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditingDate(false)}
      >
        <Pressable style={styles.dateDialogBackdrop} onPress={() => setIsEditingDate(false)}>
          <Pressable style={styles.dateDialog}>
            <View style={styles.dateDialogAccent} />
            <Text style={styles.dateDialogTitle}>CAMBIA DATA</Text>
            <Text style={styles.dateDialogText}>Inserisci la data dell’allenamento</Text>
            <TextInput
              style={styles.dateInput}
              value={dateInput}
              onChangeText={(value) => setDateInput(formatDateInput(value))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textDim}
              keyboardType="number-pad"
              maxLength={10}
              autoCapitalize="none"
              autoFocus
            />
            <View style={styles.dateDialogActions}>
              <TouchableOpacity
                style={styles.cancelDateBtn}
                onPress={() => setIsEditingDate(false)}
              >
                <Text style={styles.cancelDateBtnText}>ANNULLA</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveDateBtn}
                onPress={handleUpdateDate}
                disabled={updateSessionDate.isPending}
              >
                {updateSessionDate.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveDateBtnText}>SALVA</Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      {confirmModal}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  header: { flexDirection: "row", alignItems: "center", padding: 16, gap: 8 },
  backBtn: { padding: 8 },
  backChar: { color: colors.textMuted, fontSize: 20 },
  headerTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 4,
  },
  headerDate: {
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: "capitalize",
    marginTop: 4,
  },
  headerDivider: { height: 1, backgroundColor: colors.border },
  offlineBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.warning,
    borderBottomWidth: 1,
    borderBottomColor: colors.warning,
  },
  offlineTitle: { color: colors.text, fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  offlineText: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
  syncError: { color: colors.danger, fontSize: 11, paddingHorizontal: 16, paddingVertical: 6, backgroundColor: colors.surface },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  exerciseGroup: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exAccentBar: { width: 3, height: 36, backgroundColor: colors.accent },
  exerciseName: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 2,
  },
  equipment: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: 1,
  },
  setCount: { fontSize: 9, color: colors.textMuted, letterSpacing: 2 },
  setHeaders: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.bg,
  },
  setHeaderText: {
    fontSize: 9,
    color: colors.textDim,
    fontWeight: "700",
    letterSpacing: 2,
  },
  addSetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 16,
    backgroundColor: colors.bg,
  },
  addSetInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 15,
    width: 68,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: "center",
  },
  addSetUnit: { fontSize: 11, color: colors.textMuted },
  addSetCross: { fontSize: 11, color: colors.textDim, marginHorizontal: 8 },
  addSetBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: 8,
    alignItems: "center",
  },
  addSetBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.accent,
    letterSpacing: 3,
  },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 16 },
  emptyOrnament: { color: colors.accent, fontSize: 24 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 6,
  },
  emptyText: { fontSize: 13, color: colors.textMuted, letterSpacing: 1 },
  emptyBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.accent,
    letterSpacing: 3,
  },
  fabWrap: { position: "absolute", right: 18, bottom: 24, alignItems: "center", zIndex: 20 },
  fabBackdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0, 0, 0, 0.42)", zIndex: 18 },
  fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", elevation: 5, shadowColor: "#000", shadowOpacity: 0.28, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  fabOffline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.accent },
  fabMenu: { position: "absolute", right: 18, bottom: 116, alignItems: "flex-end", gap: 10, zIndex: 19 },
  fabAction: { flexDirection: "row", alignItems: "center", gap: 10 },
  fabActionLabel: { color: colors.text, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 7, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  fabActionIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", elevation: 4 },
  fabDangerIcon: { backgroundColor: colors.danger },
  dateDialogBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.72)", alignItems: "center", justifyContent: "center", padding: 24 },
  dateDialog: { width: "100%", maxWidth: 420, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 14 },
  dateDialogAccent: { width: 40, height: 2, backgroundColor: colors.accent },
  dateDialogTitle: { color: colors.text, fontSize: 16, fontWeight: "900", letterSpacing: 4 },
  dateDialogText: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  dateDialogActions: { flexDirection: "row", gap: 10, marginTop: 6 },
  dateInput: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    letterSpacing: 1,
  },
  saveDateBtn: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  saveDateBtnText: {
    fontSize: 10,
    fontWeight: "900",
    color: '#fff',
    letterSpacing: 2,
  },
  cancelDateBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelDateBtnText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 2,
  },
});
