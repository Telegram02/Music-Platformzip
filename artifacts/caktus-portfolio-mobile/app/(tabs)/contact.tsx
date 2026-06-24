import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";

import { useColors } from "@/hooks/useColors";
import { useSiteSettings, useSocialLinks } from "@/hooks/useSiteData";
import { api } from "@/lib/api";

const PLATFORM_ICONS: Record<string, string> = {
  youtube: "youtube",
  instagram: "instagram",
  soundcloud: "cloud",
  discord: "message-circle",
  tiktok: "video",
  twitter: "twitter",
  spotify: "music",
  twitch: "tv",
};

export default function ContactScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: settings } = useSiteSettings();
  const { data: socialLinks = [] } = useSocialLinks();

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactEmail = settings?.contactEmail ?? "";
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  async function handleSubmit() {
    if (!form.name || !form.email || !form.subject || !form.message) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSubmitting(true);
    try {
      await api.submitContact(form);
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      Alert.alert("Error", "Failed to send. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = [styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground, fontFamily: "Inter_400Regular" }];

  return (
    <KeyboardAwareScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad + 20 }}
      bottomOffset={16}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Contact</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Get in touch</Text>
      </View>

      {/* Social Links */}
      {socialLinks.length > 0 && (
        <View style={[styles.socialRow, { borderBottomColor: colors.border }]}>
          {socialLinks.map((link) => {
            const icon = PLATFORM_ICONS[link.platform.toLowerCase()] ?? "link";
            return (
              <Pressable
                key={link.id}
                onPress={() => {
                  Haptics.selectionAsync();
                  Linking.openURL(link.url);
                }}
                style={({ pressed }) => [
                  styles.socialBtn,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name={icon as any} size={18} color={colors.foreground} />
              </Pressable>
            );
          })}
          {contactEmail ? (
            <Pressable
              onPress={() => Linking.openURL(`mailto:${contactEmail}`)}
              style={({ pressed }) => [
                styles.socialBtn,
                { backgroundColor: colors.primary + "22", borderColor: colors.primary + "44", opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather name="mail" size={18} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      )}

      {/* Contact Form */}
      <View style={styles.form}>
        {submitted ? (
          <View style={[styles.successBox, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44" }]}>
            <Feather name="check-circle" size={28} color={colors.primary} />
            <Text style={[styles.successTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>Message sent!</Text>
            <Text style={[styles.successSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              I'll get back to you soon.
            </Text>
            <Pressable onPress={() => setSubmitted(false)} style={[styles.resetBtn, { borderColor: colors.border }]}>
              <Text style={[styles.resetBtnText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Send another</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={[styles.formLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Name</Text>
            <TextInput
              style={inputStyle}
              placeholder="Your name"
              placeholderTextColor={colors.mutedForeground}
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            />

            <Text style={[styles.formLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Email</Text>
            <TextInput
              style={inputStyle}
              placeholder="your@email.com"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
            />

            <Text style={[styles.formLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Subject</Text>
            <TextInput
              style={inputStyle}
              placeholder="What is this about?"
              placeholderTextColor={colors.mutedForeground}
              value={form.subject}
              onChangeText={(v) => setForm((f) => ({ ...f, subject: v }))}
            />

            <Text style={[styles.formLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Message</Text>
            <TextInput
              style={[inputStyle, styles.textArea]}
              placeholder="Tell me about your project..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={form.message}
              onChangeText={(v) => setForm((f) => ({ ...f, message: v }))}
            />

            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              style={({ pressed }) => [
                styles.submitBtn,
                { backgroundColor: colors.primary, opacity: pressed || submitting ? 0.8 : 1 },
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Feather name="send" size={16} color="#fff" />
                  <Text style={[styles.submitBtnText, { fontFamily: "Inter_600SemiBold" }]}>Send Message</Text>
                </>
              )}
            </Pressable>
          </>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 28 },
  headerSub: { fontSize: 13, marginTop: 2 },
  socialRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, padding: 20, borderBottomWidth: 1 },
  socialBtn: { width: 46, height: 46, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  form: { padding: 20, gap: 6 },
  formLabel: { fontSize: 13, marginTop: 10, marginBottom: 4 },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textArea: { height: 120, paddingTop: 12 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 16, marginTop: 12 },
  submitBtnText: { color: "#fff", fontSize: 16 },
  successBox: { borderRadius: 16, borderWidth: 1, padding: 28, alignItems: "center", gap: 8 },
  successTitle: { fontSize: 18, marginTop: 4 },
  successSub: { fontSize: 14, textAlign: "center" },
  resetBtn: { marginTop: 12, borderRadius: 8, borderWidth: 1, paddingHorizontal: 20, paddingVertical: 10 },
  resetBtnText: { fontSize: 14 },
});
