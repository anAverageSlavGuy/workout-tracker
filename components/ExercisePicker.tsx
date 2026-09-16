import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExercises } from "../hooks/useExercises";
import { Exercise, EquipmentType } from "../lib/types";
import { colors } from "../constants/colors";
import { MuscleActivationBadges } from "./MuscleActivationBadges";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

export function ExercisePicker({ visible, onClose, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(
    null,
  );
  const { data: exercises = [] } = useExercises();

  const equipmentTypes = useMemo(() => {
    const unique = new Map<string, EquipmentType>();
    exercises.forEach((e) => {
      if (e.equipment_types)
        unique.set(e.equipment_types.id, e.equipment_types);
    });
    return Array.from(unique.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [exercises]);

  const filtered = exercises.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.equipment_types?.name ?? "")
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesEquipment =
      !selectedEquipmentId || e.equipment_id === selectedEquipmentId;
    return matchesSearch && matchesEquipment;
  });

  const grouped = filtered.reduce<Record<string, Exercise[]>>((acc, ex) => {
    // Raggruppa per il muscolo con activation_percentage più alto (evita duplicati)
    if (!ex.exercise_muscles || ex.exercise_muscles.length === 0) {
      if (!acc["Altro"]) acc["Altro"] = [];
      acc["Altro"].push(ex);
    } else {
      const primaryMuscle = ex.exercise_muscles.reduce((max, em) =>
        (em.activation_percentage ?? 0) > (max.activation_percentage ?? 0) ? em : max
      );
      const muscleGroup = primaryMuscle.muscle_groups?.name ?? "Altro";
      if (!acc[muscleGroup]) acc[muscleGroup] = [];
      acc[muscleGroup].push(ex);
    }
    return acc;
  }, {});

  const sections = Object.entries(grouped).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>AGGIUNGI ESERCIZIO</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.search}
            placeholder="cerca esercizio..."
            placeholderTextColor={colors.textDim}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.equipmentScroll}
          contentContainerStyle={styles.equipmentContent}
        >
          <TouchableOpacity
            style={[
              styles.equipmentChip,
              !selectedEquipmentId && styles.equipmentChipActive,
            ]}
            onPress={() => setSelectedEquipmentId(null)}
          >
            <Text
              style={[
                styles.equipmentChipText,
                !selectedEquipmentId && styles.equipmentChipTextActive,
              ]}
            >
              TUTTI
            </Text>
          </TouchableOpacity>
          {equipmentTypes.map((eq) => (
            <TouchableOpacity
              key={eq.id}
              style={[
                styles.equipmentChip,
                selectedEquipmentId === eq.id && styles.equipmentChipActive,
              ]}
              onPress={() =>
                setSelectedEquipmentId(
                  selectedEquipmentId === eq.id ? null : eq.id,
                )
              }
            >
              <Text
                style={[
                  styles.equipmentChipText,
                  selectedEquipmentId === eq.id &&
                    styles.equipmentChipTextActive,
                ]}
              >
                {eq.name.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={sections}
          keyExtractor={([group]) => group}
          style={styles.exerciseList}
          contentContainerStyle={sections.length === 0 ? styles.emptyListContent : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nessun esercizio trovato</Text>
            </View>
          }
          renderItem={({ item: [group, exs] }) => (
            <View>
              <View style={styles.groupHeader}>
                <View style={styles.groupDot} />
                <Text style={styles.groupLabel}>{group.toUpperCase()}</Text>
              </View>
              {exs.map((ex) => {
                const displayName = ex.equipment_types
                  ? `${ex.name} (${ex.equipment_types.name})`
                  : ex.name;
                return (
                  <TouchableOpacity
                    key={ex.id}
                    style={styles.exRow}
                    onPress={() => {
                      onSelect(ex);
                      onClose();
                    }}
                  >
                    <View style={styles.exAccent} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exName}>{displayName}</Text>
                      <View style={{ marginTop: 4 }}>
                        <MuscleActivationBadges exercise={ex} size="small" />
                      </View>
                    </View>
                    <Text style={styles.addChar}>+</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 5,
  },
  closeText: { color: colors.textMuted, fontSize: 16 },
  divider: { height: 1, backgroundColor: colors.border },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
  searchIcon: { color: colors.textMuted, fontSize: 18 },
  search: { flex: 1, color: colors.text, fontSize: 14 },
  equipmentScroll: {
    maxHeight: 49,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  equipmentContent: { gap: 8, paddingHorizontal: 16, paddingVertical: 10, alignItems: "center" },
  equipmentChip: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 28,
    height: 28,
  },
  equipmentChipActive: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  equipmentChipText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 1,
  },
  equipmentChipTextActive: { color: colors.accent },
  exerciseList: { flex: 1 },
  listContent: { paddingTop: 8, paddingBottom: 24 },
  emptyListContent: { flexGrow: 1, paddingTop: 40 },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  groupDot: {
    width: 4,
    height: 4,
    backgroundColor: colors.accent,
    transform: [{ rotate: "45deg" }],
  },
  groupLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.accent,
    letterSpacing: 4,
  },
  exRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  exAccent: { width: 2, height: 28, backgroundColor: colors.border },
  exName: { fontSize: 14, color: colors.text },
  exEquip: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  addChar: { color: colors.accent, fontSize: 20, fontWeight: "300" },
  emptyState: { alignItems: "center", paddingTop: 48 },
  emptyText: { fontSize: 12, color: colors.textMuted, letterSpacing: 1 },
});
