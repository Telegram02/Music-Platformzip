import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useServices, usePricing, useSiteSettings } from "@/hooks/useSiteData";

function parsedFeatures(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return raw.split("\n").map((l) => l.trim()).filter(Boolean);
  }
}

export default function ServicesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: pricing, isLoading: pricingLoading } = usePricing();
  const { data: settings } = useSiteSettings();

  const contactEmail = settings?.contactEmail ?? "";
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleCommission = (title?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const subject = title ? `Commission Inquiry — ${title}` : "Commission Inquiry";
    if (contactEmail) {
      Linking.openURL(`mailto:${contactEmail}?subject=${encodeURIComponent(subject)}`);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: bottomPad + 20 }}
    >
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Services</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>What I offer</Text>
      </View>

      {/* Services */}
      <View style={styles.section}>
        {servicesLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : services && services.length > 0 ? (
          services.map((s) => (
            <View key={s.id} style={[styles.serviceRow, { borderColor: colors.border }]}>
              <View style={[styles.iconBox, { backgroundColor: colors.primary + "20" }]}>
                <Feather name="zap" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.serviceTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {s.title}
                </Text>
                <Text style={[styles.serviceDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={3}>
                  {s.description}
                </Text>
              </View>
            </View>
          ))
        ) : null}
      </View>

      {/* Pricing */}
      {pricing && pricing.length > 0 && (
        <View style={[styles.section, { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <Text style={[styles.sectionHeading, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Pricing</Text>
          {pricingLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            pricing.map((item) => {
              const features = parsedFeatures(item.features);
              return (
                <View
                  key={item.id}
                  style={[
                    styles.pricingCard,
                    {
                      backgroundColor: item.popular ? colors.primary + "18" : colors.card,
                      borderColor: item.popular ? colors.primary + "66" : colors.border,
                    },
                  ]}
                >
                  {item.popular && (
                    <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.popularText, { fontFamily: "Inter_600SemiBold" }]}>Popular</Text>
                    </View>
                  )}
                  <Text style={[styles.pricingTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                    {item.title}
                  </Text>
                  {item.subtitle ? (
                    <Text style={[styles.pricingSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {item.subtitle}
                    </Text>
                  ) : null}
                  <View style={styles.priceRow}>
                    <Text style={[styles.price, { color: item.popular ? colors.primary : colors.foreground, fontFamily: "Inter_700Bold" }]}>
                      {item.price}
                    </Text>
                    {item.priceUnit ? (
                      <Text style={[styles.priceUnit, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {" "}{item.priceUnit}
                      </Text>
                    ) : null}
                  </View>

                  {features.slice(0, 5).map((f, i) => (
                    <View key={i} style={styles.featureRow}>
                      <Feather name="check" size={14} color={colors.primary} />
                      <Text style={[styles.featureText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{f}</Text>
                    </View>
                  ))}

                  <Pressable
                    onPress={() => handleCommission(item.title)}
                    style={({ pressed }) => [
                      styles.commissionBtn,
                      {
                        backgroundColor: item.popular ? colors.primary : "transparent",
                        borderColor: item.popular ? colors.primary : colors.border,
                        opacity: pressed ? 0.8 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.commissionBtnText, { color: item.popular ? "#fff" : colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                      Get Started
                    </Text>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 28 },
  headerSub: { fontSize: 13, marginTop: 2 },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeading: { fontSize: 22, marginBottom: 16 },
  serviceRow: { flexDirection: "row", gap: 14, paddingVertical: 14, borderBottomWidth: 1, alignItems: "flex-start" },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 2 },
  serviceTitle: { fontSize: 15, marginBottom: 4 },
  serviceDesc: { fontSize: 13, lineHeight: 18 },
  pricingCard: { borderRadius: 16, borderWidth: 1, padding: 20, marginBottom: 16 },
  popularBadge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  popularText: { color: "#fff", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  pricingTitle: { fontSize: 20, marginBottom: 4 },
  pricingSubtitle: { fontSize: 13, marginBottom: 8 },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 16 },
  price: { fontSize: 32 },
  priceUnit: { fontSize: 14 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  featureText: { fontSize: 13, flex: 1 },
  commissionBtn: { marginTop: 16, borderRadius: 10, borderWidth: 1, paddingVertical: 14, alignItems: "center" },
  commissionBtnText: { fontSize: 15 },
});
