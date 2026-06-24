import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";
import { useSiteSettings } from "@/hooks/useSiteData";

const FALLBACK_SERVICES = [
  { id: -1, title: "Music Production", description: "Full-scale track production from concept to completion." },
  { id: -2, title: "Game Soundtracks", description: "Dynamic musical scores for indie and AAA game studios." },
  { id: -3, title: "Sound Design", description: "Bespoke sound effects and synthesis for any medium." },
  { id: -4, title: "Mixing & Mastering", description: "Industry-standard audio engineering." },
];

function StatusBadge({ text }: { text: string }) {
  const colors = useColors();
  const t = text.toLowerCase();
  const isBusy = /busy|unavailable|not accept|closed|full/.test(t);
  const isLimited = /limited|selective|winding|few spots|one spot/.test(t);
  const dotColor = isBusy ? "#ef4444" : isLimited ? "#f59e0b" : "#10b981";
  const label = isBusy ? "Unavailable" : isLimited ? "Limited Availability" : (text || "Accepting Projects");

  return (
    <View style={[styles.badge, { backgroundColor: dotColor + "22", borderColor: dotColor + "44" }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.badgeText, { color: dotColor, fontFamily: "Inter_500Medium" }]}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: settings } = useSiteSettings();
  const { data: services } = useQuery({ queryKey: ["services"], queryFn: () => api.getServices(), staleTime: 60_000 });

  const heroBadge = settings?.heroBadge ?? "Music Producer | Composer | Sound Designer";
  const tagline = settings?.tagline ?? "Cinematic soundtracks, game audio, and professional music production for artists and studios.";
  const availability = settings?.availability ?? "";
  const contactEmail = settings?.contactEmail ?? "";
  const displayServices = services && services.length > 0 ? services : FALLBACK_SERVICES;

  const handleHire = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (contactEmail) {
      Linking.openURL(`mailto:${contactEmail}?subject=Commission Inquiry`);
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient
        colors={["#1a0a2e", colors.background]}
        style={[styles.hero, { paddingTop: topPad + 24 }]}
      >
        <View style={styles.glowBg}>
          <View style={[styles.glow, { backgroundColor: colors.primary + "30" }]} />
        </View>

        <Text style={[styles.heroBadge, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {heroBadge}
        </Text>

        {availability ? <StatusBadge text={availability} /> : null}

        <Text style={[styles.heroTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          CAKTUS{"\n"}
          <Text style={{ color: colors.primary }}>PRODUCTIONS</Text>
        </Text>

        <Text style={[styles.tagline, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {tagline}
        </Text>

        <Pressable
          onPress={handleHire}
          style={({ pressed }) => [
            styles.ctaBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Feather name="mail" size={16} color="#fff" />
          <Text style={[styles.ctaBtnText, { fontFamily: "Inter_600SemiBold" }]}>Hire Me</Text>
        </Pressable>
      </LinearGradient>

      {/* Services Quick Grid */}
      <View style={[styles.section, { borderTopColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          What I Do
        </Text>
        <View style={styles.grid}>
          {displayServices.slice(0, 4).map((s) => (
            <View
              key={s.id}
              style={[styles.serviceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.serviceIcon, { backgroundColor: colors.primary + "20" }]}>
                <Feather name="music" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.serviceTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                {s.title}
              </Text>
              <Text style={[styles.serviceDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
                {s.description}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingHorizontal: 24, paddingBottom: 48, overflow: "hidden" },
  glowBg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  glow: { position: "absolute", top: 40, left: -80, width: 300, height: 300, borderRadius: 150 },
  heroBadge: { fontSize: 13, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 },
  badge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 20, gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 12 },
  heroTitle: { fontSize: 52, lineHeight: 56, letterSpacing: -1, marginBottom: 16 },
  tagline: { fontSize: 15, lineHeight: 22, marginBottom: 28 },
  ctaBtn: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 50 },
  ctaBtnText: { color: "#fff", fontSize: 15 },
  section: { paddingHorizontal: 20, paddingTop: 28, borderTopWidth: 1 },
  sectionTitle: { fontSize: 22, marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  serviceCard: { width: "47%", borderRadius: 12, borderWidth: 1, padding: 16, gap: 8 },
  serviceIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  serviceTitle: { fontSize: 14 },
  serviceDesc: { fontSize: 12, lineHeight: 17 },
});
