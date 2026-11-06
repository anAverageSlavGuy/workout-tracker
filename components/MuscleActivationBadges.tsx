import { View, Text, StyleSheet } from "react-native";
import { Exercise } from "../lib/types";
import { colors } from "../constants/colors";

interface Props {
  exercise: Exercise;
  size?: "small" | "medium";
}

function getActivationColor(percentage: number): { background: string; text: string } {
  if (percentage >= 50) return { background: "#dff3e5", text: "#4e8a5c" };
  if (percentage >= 20) return { background: "#fff1c9", text: "#a88431" };
  return { background: "#fbe1de", text: "#ad665f" };
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
                backgroundColor: color.background,
                height: badgeHeight,
                paddingHorizontal: paddingH,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { fontSize, lineHeight: badgeHeight, color: color.text },
              ]}
            >
              {em.muscle_groups?.name}
            </Text>
            <Text
              style={[
                styles.badgePercent,
                { fontSize: fontSize - 2, lineHeight: badgeHeight, color: color.text },
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
    borderRadius: 10,
    paddingVertical: 2,
    justifyContent: "center",
  },
  badgeText: {
    fontWeight: "600",
    color: colors.textMuted,
  },
  badgePercent: {
    fontWeight: "500",
    color: colors.textMuted,
    opacity: 0.7,
  },
});
