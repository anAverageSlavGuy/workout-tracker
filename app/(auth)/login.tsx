import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../lib/supabase";
import { colors } from "../../constants/colors";
import { ToastHost, useToast } from "../../components/Toast";

type Tab = "login" | "register";

export default function LoginScreen() {
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast, showToast } = useToast(3500);

  async function handleLogin() {
    if (!email || !password) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) showToast(error.message, "error");
  }

  async function handleRegister() {
    if (!email || !password) {
      showToast("Inserisci email e password per registrarti.", "info");
      return;
    }
    if (password.length < 6) {
      showToast("La password deve essere almeno 6 caratteri.", "error");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) showToast(error.message, "error");
    else showToast("Registrazione avviata. Controlla la tua email.", "success");
  }

  async function handleReset() {
    if (!email) {
      showToast("Inserisci la tua email prima.", "info");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (error) showToast(error.message, "error");
    else showToast("Email di reset inviata. Controlla la posta.", "success");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        {/* Decorative lines */}
        <View style={styles.ornamentTop}>
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentDiamond} />
          <View style={styles.ornamentLine} />
        </View>

        <View style={styles.brandMark}><Text style={styles.brandMarkText}>PI</Text></View>
        <Text style={styles.title}>Pumping Iron</Text>
        <Text style={styles.subtitle}>Allenati. Tieni il ritmo.</Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "login" && styles.tabActive]}
            onPress={() => setTab("login")}
          >
            <Text
              style={[styles.tabText, tab === "login" && styles.tabTextActive]}
            >
              Accedi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === "register" && styles.tabActive]}
            onPress={() => setTab("register")}
          >
            <Text
              style={[
                styles.tabText,
                tab === "register" && styles.tabTextActive,
              ]}
            >
              Registrati
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textDim}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textDim}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={tab === "login" ? handleLogin : handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.primaryBtnText}>
              {tab === "login" ? "ACCEDI" : "REGISTRATI"}
            </Text>
          )}
        </TouchableOpacity>

        {tab === "login" && (
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.forgotText}>Password dimenticata?</Text>
          </TouchableOpacity>
        )}

        <View style={styles.ornamentBottom}>
          <View style={styles.ornamentLine} />
          <View style={styles.ornamentDiamond} />
          <View style={styles.ornamentLine} />
        </View>
      </View>

      <ToastHost toast={toast} bottom={40} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, justifyContent: "center" },
  inner: { marginHorizontal: 20, padding: 24, gap: 16, backgroundColor: colors.surface, borderRadius: 30, shadowColor: '#6b625c', shadowOpacity: 0.1, shadowRadius: 24, shadowOffset: { width: 0, height: 10 } },
  ornamentTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  ornamentBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  ornamentMid: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 0,
  },
  ornamentLine: { height: 1, backgroundColor: '#eee8e2', flex: 1 },
  ornamentDiamond: {
    width: 6,
    height: 6,
    backgroundColor: colors.accent,
    transform: [{ rotate: "45deg" }],
  },
  ornamentChar: { color: colors.accent, fontSize: 12 },
  brandMark: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 2 },
  brandMarkText: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: -1 },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: -8,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.bg,
    borderRadius: 18,
    padding: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 14 },
  tabActive: { backgroundColor: colors.surface, shadowColor: '#6b625c', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  tabTextActive: { color: colors.accent },
  input: {
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 0,
    letterSpacing: 1,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 17,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 0,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
  },
  forgotText: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 12,
    marginTop: -4,
    letterSpacing: 1,
  },
});
