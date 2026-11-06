import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { format, startOfWeek, startOfMonth } from "date-fns";
import { it } from "date-fns/locale";
import { useAuth } from "../../lib/auth";
import { useSessions, useCreateSession } from "../../hooks/useSessions";
import { useTemplates } from "../../hooks/useTemplates";
import { colors } from "../../constants/colors";

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const { data: sessions = [] } = useSessions();
  const { data: templates = [] } = useTemplates();
  const createSession = useCreateSession();

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
    .toISOString()
    .split("T")[0];
  const monthStart = startOfMonth(today).toISOString().split("T")[0];

  const thisWeek = sessions.filter((s) => s.date >= weekStart).length;
  const thisMonth = sessions.filter((s) => s.date >= monthStart).length;
  const recent = sessions.slice(0, 3);

  async function startSession(templateId?: string) {
    setShowModal(false);
    const session = await createSession.mutateAsync({
      template_id: templateId,
    });
    router.push(`/session/${session.id}?created=true`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.eyebrow}>BUONGIORNO</Text>
              <Text style={styles.greeting}>{user?.email?.split("@")[0]}</Text>
            </View>
            <View style={styles.avatar}><Text style={styles.avatarText}>{(user?.email?.[0] ?? 'P').toUpperCase()}</Text></View>
          </View>
          <Text style={styles.dateText}>{format(today, "EEEE d MMMM", { locale: it })}</Text>
        </View>

        {/* Start button */}
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => setShowModal(true)}
        >
          <View style={styles.startBtnInner}>
            <View><Text style={styles.startEyebrow}>PRONTO A SPINGERE?</Text><Text style={styles.startBtnLabel}>Inizia allenamento</Text></View>
            <View style={styles.startIcon}><Text style={styles.startIconText}>↗</Text></View>
          </View>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardDark]}>
            <Text style={[styles.statNum, styles.statNumLight]}>{thisWeek}</Text>
            <View style={styles.statDivider} />
            <Text style={[styles.statLabel, styles.statLabelLight]}>SETTIMANA</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{thisMonth}</Text>
            <View style={styles.statDivider} />
            <Text style={styles.statLabel}>QUESTO MESE</Text>
          </View>
        </View>

        {/* Recent sessions */}
        {recent.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ultimi allenamenti</Text>
              <TouchableOpacity onPress={() => router.push('/history')} hitSlop={8}>
                <Text style={styles.sectionLink}>Vedi tutto</Text>
              </TouchableOpacity>
            </View>
            {recent.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.sessionCard}
                onPress={() => router.push(`/session/${s.id}`)}
              >
                <Text style={styles.sessionDate}>
                  {format(new Date(s.date), "dd/MM", { locale: it })}
                </Text>
                <View style={styles.sessionDividerV} />
                <Text style={styles.sessionInfo} numberOfLines={1}>
                  {[...new Set(s.session_sets?.map((ss) => ss.exercises?.name))]
                    .filter(Boolean)
                    .slice(0, 3)
                    .join(" · ") || "Nessun set"}
                </Text>
                <Text style={styles.sessionSets}>
                  {s.session_sets?.length ?? 0}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>SCEGLI ALLENAMENTO</Text>
          <TouchableOpacity
            style={styles.sheetOption}
            onPress={() => startSession()}
          >
            <Text style={styles.sheetOptionText}>Sessione libera</Text>
            <Text style={styles.sheetOptionSub}>nessun template</Text>
          </TouchableOpacity>
          {templates.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.sheetOption, styles.sheetOptionTemplate]}
              onPress={() => startSession(t.id)}
            >
              <Text style={styles.sheetOptionText}>{t.name}</Text>
              <Text style={styles.sheetOptionSub}>
                {t.template_exercises?.length ?? 0} esercizi
              </Text>
            </TouchableOpacity>
          ))}
          {createSession.isPending && (
            <ActivityIndicator
              color={colors.accent}
              style={{ marginTop: 12 }}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
    content: { padding: 20, paddingBottom: 110, gap: 18 },
  header: { gap: 8, paddingTop: 10, paddingBottom: 2 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 11, color: colors.textDim, fontWeight: '800', letterSpacing: 2 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.accentDim, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.accent, fontSize: 16, fontWeight: '900' },
  ornamentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  ornamentChar: { color: colors.accent, fontSize: 12 },
  greeting: {
    fontSize: 28,
    color: colors.text,
    fontWeight: "900",
    marginTop: 3,
  },
  dateText: {
    fontSize: 13,
    color: colors.textMuted,
    textTransform: "capitalize",
  },
  startBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: colors.accent,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
  },
  startBtnInner: { flexDirection: 'row', alignItems: "center", justifyContent: 'space-between' },
  startEyebrow: { color: '#ffe3d8', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 5 },
  startBtnLabel: {
    fontSize: 22,
    fontWeight: "900",
    color: '#fff',
  },
  startIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  startIconText: { color: colors.accent, fontSize: 24, fontWeight: '700' },
  statsRow: {
    flexDirection: "row",
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  statCard: { flex: 1, padding: 18, gap: 8, minHeight: 108, justifyContent: 'center' },
  statCardDark: { backgroundColor: colors.surfaceHigh },
  statNum: { fontSize: 38, fontWeight: "900", color: colors.accent },
  statNumLight: { color: '#fff' },
  statDivider: { width: 22, height: 4, borderRadius: 2, backgroundColor: colors.accent },
  statLabel: { fontSize: 10, color: colors.textDim, fontWeight: '800', letterSpacing: 1 },
  statLabelLight: { color: '#aaa7a1' },
  section: { gap: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { fontSize: 21, color: colors.text, fontWeight: '900' },
  sectionLink: { fontSize: 11, color: colors.accent, fontWeight: '800' },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 20,
    shadowColor: '#6b625c', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 5 },
  },
  sessionDate: {
    display: "flex",
    fontSize: 13,
    fontWeight: "700",
    color: colors.accent,
    width: 38,
  },
  sessionDividerV: { width: 1, height: 28, backgroundColor: colors.border },
  sessionInfo: { flex: 1, fontSize: 12, color: colors.textMuted },
  sessionSets: { fontSize: 11, color: colors.textDim },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 8,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#d7d1cb',
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 5,
    marginBottom: 8,
  },
  sheetOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    backgroundColor: colors.bg,
    borderRadius: 16,
  },
  sheetOptionTemplate: { borderLeftColor: colors.accent, borderLeftWidth: 2 },
  sheetOptionText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 1,
  },
  sheetOptionSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: 1,
  },
});
