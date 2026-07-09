import { View, Text, StyleSheet } from "react-native";
import { Exercise } from "../lib/types";
import { colors } from "../constants/colors";

interface Props {
  exercise: Exercise;
  size?: "small" | "medium";
}

function getActivationColor(percentage: number): string {
  if (percentage >= 50) return "#4ade80"; // 🟢 Verde (alto)
  if (percentage >= 20) return "#facc15"; // 🟡 Giallo (medio)
  return "#ef4444"; // 🔴 Rosso (basso)
}

export function MuscleActivationBadges({ exercise, size = "small" }: Props) {
  const muscles = exercise.exercise_muscles
    ?.filter((em) => em.muscle_groups)
    .sort((a, b) => (b.activation_percentage ?? 0) - (a.activation_percentage ?? 0)) ?? [];

  if (muscles.length === 0) return null;

  const isMedium = size === "medium";
  const badgeHeight = isMedium ? 24 : 20;
  const fontSize = isMedium ? 12 : 10;
  const paddingH = isMedium ? 8 : 6;

  return (
    <View style={styles.container}>
      {muscles.map((em) => {
        const color = getActivationColor(em.activation_percentage ?? 0);
        return (
          <View
            key={em.muscle_group_id}
            style={[
              styles.badge,
              {
                backgroundColor: color,
                height: badgeHeight,
                paddingHorizontal: paddingH,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { fontSize, lineHeight: badgeHeight },
              ]}
            >
              {em.muscle_groups?.name}
            </Text>
            <Text
              style={[
                styles.badgePercent,
                { fontSize: fontSize - 2, lineHeight: badgeHeight },
              ]}
            >
              {em.activation_percentage?.toFixed(0)}%
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 4,
    flexWrap: "wrap",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 4,
    paddingVertical: 2,
    justifyContent: "center",
  },
  badgeText: {
    fontWeight: "600",
    color: "#000",
  },
  badgePercent: {
    fontWeight: "500",
    color: "#000",
    opacity: 0.7,
  },
});
