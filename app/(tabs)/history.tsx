import { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { it } from "date-fns/locale";
import { useSessions } from "../../hooks/useSessions";
import { useMuscleGroups } from "../../hooks/useExercises";
import { useTemplates } from "../../hooks/useTemplates";
import { colors } from "../../constants/colors";
import { Session } from "../../lib/types";

type ExportRange = "7d" | "1m" | "3m" | "6m" | "1y";

const exportRanges: Array<{ value: ExportRange; label: string }> = [
  { value: "7d", label: "Ultima settimana" },
  { value: "1m", label: "Ultimo mese" },
  { value: "3m", label: "Ultimi 3 mesi" },
  { value: "6m", label: "Ultimi 6 mesi" },
  { value: "1y", label: "Ultimo anno" },
];

export default function HistoryScreen() {
  const router = useRouter();
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportRange, setExportRange] = useState<ExportRange>("3m");
  const [isExporting, setIsExporting] = useState(false);
  const { data: muscleGroups = [] } = useMuscleGroups();
  const { data: sessions = [], isLoading } = useSessions(
    selectedMuscle ? { muscleGroupId: selectedMuscle } : undefined,
  );
  const { data: exportSessions = [] } = useSessions();
  const { data: templates = [] } = useTemplates();

  const sessionsByDate = useMemo(() => {
    const map: Record<string, Session[]> = {};
    sessions.forEach((s) => {
      const dateStr = s.date;
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(s);
    });
    return map;
  }, [sessions]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const selectedExportRange =
    exportRanges.find((option) => option.value === exportRange) ??
    exportRanges[1];
  const templateNames = useMemo(() => {
    return new Map(templates.map((template) => [template.id, template.name]));
  }, [templates]);

  async function handleExportPdf() {
    const from = getExportStartDate(exportRange);
    const to = new Date();
    const filteredSessions = exportSessions.filter((session) => {
      const sessionDate = parseISO(session.date);
      return sessionDate >= from && sessionDate <= to;
    });

    if (filteredSessions.length === 0) {
      Alert.alert(
        "Nessun allenamento",
        `Non ci sono allenamenti per ${selectedExportRange.label.toLowerCase()}.`,
      );
      return;
    }

    try {
      setIsExporting(true);

      if (Platform.OS === "web") {
        setExportModalVisible(false);
        await downloadWorkoutHistoryPdfOnWeb(
          filteredSessions,
          templateNames,
          from,
          to,
          selectedExportRange.label,
        );
      } else {
        const html = buildWorkoutHistoryHtml(
          filteredSessions,
          templateNames,
          from,
          to,
          selectedExportRange.label,
        );
        const { uri } = await Print.printToFileAsync({ html });
        const canShare = await Sharing.isAvailableAsync();

        if (!canShare) {
          setExportModalVisible(false);
          Alert.alert("PDF creato", `File salvato in cache: ${uri}`);
          return;
        }

        await Sharing.shareAsync(uri, {
          UTI: ".pdf",
          mimeType: "application/pdf",
          dialogTitle: "Scarica storico allenamenti",
        });
      }

      setExportModalVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Export non riuscito",
        "Non sono riuscito a generare il PDF. Riprova tra poco.",
      );
    } finally {
      setIsExporting(false);
    }
  }

  function renderSession({ item }: { item: Session }) {
    const exercises = [
      ...new Set(item.session_sets?.map((s) => s.exercises?.name)),
    ].filter(Boolean);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/session/${item.id}`)}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.cardDay}>
            {format(new Date(item.date), "dd", { locale: it })}
          </Text>
          <Text style={styles.cardMonth}>
            {format(new Date(item.date), "MMM", { locale: it }).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardDivider} />
        <View style={styles.cardRight}>
          <Text style={styles.cardExercises} numberOfLines={1}>
            {exercises.slice(0, 3).join(" · ") || "Nessun esercizio"}
          </Text>
          <Text style={styles.cardSets}>
            {item.session_sets?.length ?? 0} SET
          </Text>
        </View>
        <View style={styles.cardArrow}>
          <Text style={{ color: colors.accent, fontSize: 16 }}>›</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerWrap}>
        <View style={styles.ornamentRow}>
          <View style={styles.line} />
          <Text style={styles.ornamentChar}>✦</Text>
          <View style={styles.line} />
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.title}>STORICO</Text>
          <View style={styles.viewTabs}>
            <TouchableOpacity
              style={[styles.viewTab, view === "list" && styles.viewTabActive]}
              onPress={() => setView("list")}
            >
              <Text
                style={[
                  styles.viewTabText,
                  view === "list" && styles.viewTabTextActive,
                ]}
              >
                LIST
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewTab,
                view === "calendar" && styles.viewTabActive,
              ]}
              onPress={() => setView("calendar")}
            >
              <Text
                style={[
                  styles.viewTabText,
                  view === "calendar" && styles.viewTabTextActive,
                ]}
              >
                CAL
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewTab}
              onPress={() => setExportModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Scarica storico allenamenti"
            >
              <Ionicons
                name="download-outline"
                size={18}
                color={colors.accent}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={exportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setExportModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => !isExporting && setExportModalVisible(false)}
        >
          <Pressable style={styles.exportDialog}>
            <View style={styles.accentLine} />
            <Text style={styles.modalTitle}>SCARICA PDF</Text>
            <Text style={styles.modalCopy}>
              Scegli da quando includere lo storico degli allenamenti.
            </Text>

            <Text style={styles.selectLabel}>PERIODO</Text>
            <View style={styles.selectBox}>
              {exportRanges.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.selectOption,
                    exportRange === option.value && styles.selectOptionActive,
                  ]}
                  onPress={() => setExportRange(option.value)}
                  disabled={isExporting}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      exportRange === option.value &&
                        styles.selectOptionTextActive,
                    ]}
                  >
                    {option.label.toUpperCase()}
                  </Text>
                  {exportRange === option.value && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={colors.accent}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setExportModalVisible(false)}
                disabled={isExporting}
              >
                <Text style={styles.cancelText}>ANNULLA</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.exportBtn,
                  isExporting && styles.exportBtnDisabled,
                ]}
                onPress={handleExportPdf}
                disabled={isExporting}
              >
                {isExporting ? (
                  <ActivityIndicator color={colors.text} size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="download-outline"
                      size={15}
                      color={colors.text}
                    />
                    <Text style={styles.exportText}>SCARICA</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.chip, !selectedMuscle && styles.chipActive]}
          onPress={() => setSelectedMuscle(null)}
        >
          <Text
            style={[styles.chipText, !selectedMuscle && styles.chipTextActive]}
          >
            TUTTI
          </Text>
        </TouchableOpacity>
        {muscleGroups.map((mg) => (
          <TouchableOpacity
            key={mg.id}
            style={[styles.chip, selectedMuscle === mg.id && styles.chipActive]}
            onPress={() =>
              setSelectedMuscle(selectedMuscle === mg.id ? null : mg.id)
            }
          >
            <Text
              style={[
                styles.chipText,
                selectedMuscle === mg.id && styles.chipTextActive,
              ]}
            >
              {mg.name.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {view === "list" ? (
        <FlatList
          style={styles.flatlist}
          data={sessions}
          keyExtractor={(s) => s.id}
          renderItem={renderSession}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: colors.border }} />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {isLoading ? "..." : "Nessun allenamento trovato"}
            </Text>
          }
        />
      ) : (
        <ScrollView contentContainerStyle={styles.calendarContent}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                  ),
                )
              }
            >
              <Text style={styles.calendarNav}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.calendarMonth}>
              {format(currentMonth, "MMMM yyyy", { locale: it }).toUpperCase()}
            </Text>
            <TouchableOpacity
              onPress={() =>
                setCurrentMonth(
                  new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                  ),
                )
              }
            >
              <Text style={styles.calendarNav}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calendarWeekHeader}>
            {["LUN", "MAR", "MER", "GIO", "VEN", "SAB", "DOM"].map((day) => (
              <Text key={day} style={styles.calendarWeekDay}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const hasSessions = dateStr in sessionsByDate;
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const sessionsForDay = sessionsByDate[dateStr] || [];

              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[
                    styles.calendarDay,
                    !isCurrentMonth && styles.calendarDayOther,
                    hasSessions && styles.calendarDayHasSessions,
                  ]}
                  onPress={() =>
                    hasSessions &&
                    router.push(`/session/${sessionsForDay[0].id}`)
                  }
                >
                  <Text
                    style={[
                      styles.calendarDayNum,
                      !isCurrentMonth && styles.calendarDayNumOther,
                      hasSessions && styles.calendarDayNumActive,
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                  {hasSessions && <View style={styles.calendarDayDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function getExportStartDate(range: ExportRange) {
  const today = new Date();
  if (range === "7d") return startOfDay(subDays(today, 7));
  if (range === "1m") return startOfDay(subMonths(today, 1));
  if (range === "3m") return startOfDay(subMonths(today, 3));
  if (range === "6m") return startOfDay(subMonths(today, 6));
  return startOfDay(subYears(today, 1));
}

function buildWorkoutHistoryHtml(
  sessions: Session[],
  templateNames: Map<string, string>,
  from: Date,
  to: Date,
  rangeLabel: string,
) {
  const sortedSessions = [...sessions].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  const sessionBlocks = sortedSessions
    .map((session) => {
      const groupedSets = new Map<
        string,
        NonNullable<Session["session_sets"]>
      >();

      (session.session_sets ?? []).forEach((set) => {
        const key = set.exercise_id;
        const existing = groupedSets.get(key) ?? [];
        existing.push(set);
        groupedSets.set(key, existing);
      });

      const templateName = session.template_id
        ? templateNames.get(session.template_id) ?? "Template non trovato"
        : "Allenamento libero";
      const sessionDate = format(parseISO(session.date), "dd/MM/yyyy");

      if (groupedSets.size === 0) {
        return `
          <section class="session">
            <div class="sessionHeader">
              <div><span>Data</span><strong>${escapeHtml(sessionDate)}</strong></div>
              <div><span>Template</span><strong>${escapeHtml(templateName)}</strong></div>
            </div>
            <table>
              <tbody>
                <tr>
                  <td>Nessun esercizio</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </section>
      `;
      }

      const exerciseRows = Array.from(groupedSets.values())
        .map((sets) => {
          const orderedSets = [...sets].sort(
            (a, b) => a.set_number - b.set_number,
          );
          const firstSet = orderedSets[0];
          const exerciseName = firstSet.exercises?.name ?? "Esercizio";
          const equipmentName = firstSet.exercises?.equipment_types?.name;
          const setSummary = orderedSets
            .map((set, setIndex) => {
              const type = set.set_type
                ? ` <span class="setType">${set.set_type === "topset" ? "T" : "B"}</span>`
                : "";
              return `
                <div class="setLine">
                  <span class="setNumber">${setIndex + 1}</span>
                  <span>${escapeHtml(formatNumber(set.weight))} kg x ${escapeHtml(set.reps == null ? "MAX" : String(set.reps))}${type}</span>
                </div>
              `;
            })
            .join("");

          return `
            <tr>
              <td class="exerciseName">
                ${escapeHtml(exerciseName)}
                ${equipmentName ? `<span class="equipmentName">(${escapeHtml(equipmentName)})</span>` : ""}
              </td>
              <td>${setSummary}</td>
            </tr>
          `;
        })
        .join("");

      return `
        <section class="session">
          <div class="sessionHeader">
            <div><span>Data</span><strong>${escapeHtml(sessionDate)}</strong></div>
            <div><span>Template</span><strong>${escapeHtml(templateName)}</strong></div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 170px;">Esercizio</th>
                <th>Serie</th>
              </tr>
            </thead>
            <tbody>${exerciseRows}</tbody>
          </table>
        </section>
      `;
    })
    .join("");


  return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          @page { margin: 32px; }
          body { color: #272727; font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif; font-size: 10px; margin: 0; }
          h1 { font-size: 18px; letter-spacing: 3px; margin: 0 0 6px; text-transform: uppercase; }
          .meta { color: #4f4f4f; margin-bottom: 14px; }
          .session { break-inside: avoid; margin-bottom: 18px; }
          .sessionHeader { background: #272727; color: #ffffff; display: grid; grid-template-columns: 92px 1fr; }
          .sessionHeader div { padding: 9px 10px; border-right: 1px solid #ffffff; }
          .sessionHeader div:last-child { border-right: 0; }
          .sessionHeader span { color: rgba(255, 65, 5, 0.7); display: block; font-size: 7px; letter-spacing: 1px; margin-bottom: 2px; text-transform: uppercase; }
          .sessionHeader strong { font-size: 10px; }
          .session table { margin-top: 6px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #272727; padding: 7px 8px; vertical-align: top; }
          th { background: rgba(255, 65, 5, 0.14); font-size: 8px; letter-spacing: 1px; text-align: left; text-transform: uppercase; }
          .exerciseName { font-weight: 700; }
          .equipmentName { color: #4f4f4f; display: block; font-size: 8px; font-weight: 400; margin-top: 2px; }
          .setLine { align-items: center; border-bottom: 1px solid #d9d9d9; display: grid; gap: 6px; grid-template-columns: 18px 1fr; padding: 3px 0; }
          .setLine:first-child { padding-top: 0; }
          .setLine:last-child { border-bottom: 0; padding-bottom: 0; }
          .setNumber { color: #4f4f4f; font-size: 8px; font-weight: 700; }
          .setType { color: #ff4105; font-size: 9px; font-weight: 900; margin-left: 4px; }
        </style>
      </head>
      <body>
        <h1>Storico Allenamenti</h1>
        <div class="meta">${escapeHtml(rangeLabel)} - dal ${escapeHtml(format(from, "dd/MM/yyyy"))} al ${escapeHtml(format(to, "dd/MM/yyyy"))} | Allenamenti: ${sortedSessions.length}</div>
        ${sessionBlocks}
      </body>
    </html>`;
}

type WorkoutReportSet = {
  index: number;
  weight: number;
  reps: number | null;
  type: "topset" | "backoff" | null;
};

type WorkoutReportExercise = {
  name: string;
  equipmentName?: string;
  sets: WorkoutReportSet[];
};

type WorkoutReportSession = {
  date: string;
  templateName: string;
  exercises: WorkoutReportExercise[];
};

async function downloadWorkoutHistoryPdfOnWeb(
  sessions: Session[],
  templateNames: Map<string, string>,
  from: Date,
  to: Date,
  rangeLabel: string,
) {
  if (typeof window === "undefined") return;

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const reportSessions = buildWorkoutReportSessions(sessions, templateNames);
  const fileName = `storico-allenamenti-${format(to, "yyyy-MM-dd")}.pdf`;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  const exerciseWidth = 170;
  const seriesWidth = contentWidth - exerciseWidth;
  let y = margin;

  function addPageIfNeeded(height: number) {
    if (y + height <= pageHeight - margin) return;
    doc.addPage();
    y = margin;
  }

  function drawDocumentTitle() {
    doc.setTextColor(39, 39, 39);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("STORICO ALLENAMENTI", margin, y);
    y += 18;

    doc.setTextColor(79, 79, 79);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `${rangeLabel} - dal ${format(from, "dd/MM/yyyy")} al ${format(to, "dd/MM/yyyy")} | Allenamenti: ${reportSessions.length}`,
      margin,
      y,
    );
    y += 24;
  }

  function drawSessionHeader(session: WorkoutReportSession) {
    addPageIfNeeded(48);

    doc.setFillColor(39, 39, 39);
    doc.rect(margin, y, contentWidth, 32, "F");

    doc.setTextColor(243, 210, 214);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("DATA", margin + 10, y + 11);
    doc.text("TEMPLATE", margin + 104, y + 11);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(session.date, margin + 10, y + 24);
    doc.text(
      doc.splitTextToSize(session.templateName, contentWidth - 116)[0] ?? "",
      margin + 104,
      y + 24,
    );

    y += 40;
  }

  function drawTableHeader() {
    addPageIfNeeded(24);
    doc.setDrawColor(39, 39, 39);
    doc.setFillColor(243, 210, 214);
    doc.rect(margin, y, exerciseWidth, 22, "FD");
    doc.rect(margin + exerciseWidth, y, seriesWidth, 22, "FD");

    doc.setTextColor(39, 39, 39);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("ESERCIZIO", margin + 8, y + 14);
    doc.text("SERIE", margin + exerciseWidth + 8, y + 14);
    y += 22;
  }

  function drawExerciseRow(exercise: WorkoutReportExercise) {
    const nameLines = doc.splitTextToSize(exercise.name, exerciseWidth - 16);
    const equipmentLines = exercise.equipmentName
      ? doc.splitTextToSize(`(${exercise.equipmentName})`, exerciseWidth - 16)
      : [];
    const nameHeight = nameLines.length * 11 + equipmentLines.length * 10 + 14;
    const rowHeight = Math.max(
      nameHeight,
      exercise.sets.length * 15 + 12,
      30,
    );

    addPageIfNeeded(rowHeight);

    doc.setDrawColor(39, 39, 39);
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, exerciseWidth, rowHeight, "S");
    doc.rect(margin + exerciseWidth, y, seriesWidth, rowHeight, "S");

    doc.setTextColor(39, 39, 39);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(nameLines, margin + 8, y + 14);

    if (equipmentLines.length > 0) {
      doc.setTextColor(79, 79, 79);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(equipmentLines, margin + 8, y + 14 + nameLines.length * 11);
    }

    doc.setFont("helvetica", "normal");
    exercise.sets.forEach((set, setIndex) => {
      const lineY = y + 14 + setIndex * 15;
      const setLabel = `${set.index}`;
      const setText = `${formatNumber(set.weight)} kg x ${set.reps == null ? "MAX" : set.reps}`;

      doc.setTextColor(79, 79, 79);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(setLabel, margin + exerciseWidth + 8, lineY);

      doc.setTextColor(39, 39, 39);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(setText, margin + exerciseWidth + 28, lineY);

      if (set.type) {
        doc.setTextColor(212, 31, 46);
        doc.setFont("helvetica", "bold");
        doc.text(
          set.type === "topset" ? "T" : "B",
          margin + exerciseWidth + 32 + doc.getTextWidth(setText),
          lineY,
        );
      }
    });

    y += rowHeight;
  }

  drawDocumentTitle();

  reportSessions.forEach((session) => {
    const estimatedHeight =
      62 +
      session.exercises.reduce(
        (sum, exercise) => sum + Math.max(exercise.sets.length * 15 + 12, 30),
        0,
      );
    addPageIfNeeded(Math.min(estimatedHeight, pageHeight - margin * 2));
    drawSessionHeader(session);
    drawTableHeader();

    if (session.exercises.length === 0) {
      drawExerciseRow({ name: "Nessun esercizio", sets: [] });
    } else {
      session.exercises.forEach(drawExerciseRow);
    }

    y += 18;
  });

  const blob = doc.output("blob");
  const navigatorWithShare = window.navigator as Navigator & {
    canShare?: (data: { files?: File[] }) => boolean;
    share?: (data: { files?: File[]; title?: string }) => Promise<void>;
  };
  const file =
    typeof File === "undefined"
      ? null
      : new File([blob], fileName, { type: "application/pdf" });

  if (
    file &&
    navigatorWithShare.share &&
    (!navigatorWithShare.canShare ||
      navigatorWithShare.canShare({ files: [file] }))
  ) {
    await navigatorWithShare.share({
      files: [file],
      title: "Storico allenamenti",
    });
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildWorkoutReportSessions(
  sessions: Session[],
  templateNames: Map<string, string>,
): WorkoutReportSession[] {
  return [...sessions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((session) => {
      const groupedSets = new Map<
        string,
        NonNullable<Session["session_sets"]>
      >();

      (session.session_sets ?? []).forEach((set) => {
        const key = set.exercise_id;
        const existing = groupedSets.get(key) ?? [];
        existing.push(set);
        groupedSets.set(key, existing);
      });

      return {
        date: format(parseISO(session.date), "dd/MM/yyyy"),
        templateName: session.template_id
          ? templateNames.get(session.template_id) ?? "Template non trovato"
          : "Allenamento libero",
        exercises: Array.from(groupedSets.values()).map((sets) => {
          const orderedSets = [...sets].sort(
            (a, b) => a.set_number - b.set_number,
          );
          const firstSet = orderedSets[0];

          return {
            name: firstSet.exercises?.name ?? "Esercizio",
            equipmentName: firstSet.exercises?.equipment_types?.name,
            sets: orderedSets.map((set, index) => ({
              index: index + 1,
              weight: set.weight,
              reps: set.reps,
              type: set.set_type,
            })),
          };
        }),
      };
    });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("it-IT", { maximumFractionDigits: 1 }).format(
    value,
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerWrap: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  ornamentRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  ornamentChar: { color: colors.accent, fontSize: 12 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 8,
  },
  viewTabs: { flexDirection: "row", gap: 4 },
  viewTab: {
    width: 42,
    height: 32,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  viewTabActive: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  viewTabText: {
    fontSize: 8,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 1,
  },
  viewTabTextActive: { color: colors.accent },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  exportDialog: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 14,
  },
  accentLine: { width: 40, height: 2, backgroundColor: colors.accent },
  modalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 4,
  },
  modalCopy: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  selectLabel: {
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 2,
    fontWeight: "700",
    marginTop: 2,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  selectOption: {
    minHeight: 42,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectOptionActive: { backgroundColor: colors.accentDim },
  selectOptionText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  selectOptionTextActive: { color: colors.accent },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  exportBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    minHeight: 42,
  },
  exportBtnDisabled: { opacity: 0.7 },
  cancelText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  exportText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  filterScroll: {
    maxHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 28,
    height: 28,
  },
  chipActive: { backgroundColor: colors.accentDim, borderColor: colors.accent },
  chipText: {
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 1,
    fontWeight: "700",
  },
  chipTextActive: { color: colors.accent },
  flatlist: { flex: 1 },
  list: { paddingVertical: 0 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 16,
    backgroundColor: colors.bg,
  },
  cardLeft: { alignItems: "center", width: 36 },
  cardDay: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.accent,
    lineHeight: 24,
  },
  cardMonth: { fontSize: 9, color: colors.textMuted, letterSpacing: 2 },
  cardDivider: { width: 1, height: 36, backgroundColor: colors.border },
  cardRight: { flex: 1, gap: 4 },
  cardExercises: { fontSize: 13, color: colors.text, fontWeight: "500" },
  cardSets: { fontSize: 9, color: colors.textMuted, letterSpacing: 2 },
  cardArrow: { paddingLeft: 8 },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 60,
    letterSpacing: 2,
  },
  calendarContent: { padding: 16, gap: 16 },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  calendarNav: {
    fontSize: 20,
    color: colors.accent,
    fontWeight: "900",
    paddingHorizontal: 12,
  },
  calendarMonth: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 2,
  },
  calendarWeekHeader: { flexDirection: "row", marginBottom: 8 },
  calendarWeekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 1,
  },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  calendarDay: {
    width: "14.285%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  calendarDayOther: { opacity: 0.3, backgroundColor: colors.bg },
  calendarDayHasSessions: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
    borderWidth: 2,
  },
  calendarDayNum: { fontSize: 12, fontWeight: "700", color: colors.text },
  calendarDayNumOther: { color: colors.textMuted },
  calendarDayNumActive: { color: colors.accent },
  calendarDayDot: {
    width: 4,
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
    marginTop: 2,
  },
});
