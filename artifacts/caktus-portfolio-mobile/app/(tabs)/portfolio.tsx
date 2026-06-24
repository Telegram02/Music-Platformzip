import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Linking, Platform, Pressable, FlatList, StyleSheet, Text, View, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { usePortfolioItems } from "@/hooks/useSiteData";
import { storageUrl, type PortfolioItem } from "@/lib/api";

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const colors = useColors();

  const openLink = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = item.externalLink || item.embedUrl;
    if (url) Linking.openURL(url);
  };

  const imgUrl = item.imageUrl ? storageUrl(item.imageUrl) : "";

  return (
    <Pressable
      onPress={openLink}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      {imgUrl ? (
        <Image source={{ uri: imgUrl }} style={styles.cardImage} resizeMode="cover" />
      ) : (
        <View style={[styles.cardImagePlaceholder, { backgroundColor: colors.primary + "18" }]}>
          <Feather name="film" size={32} color={colors.primary} />
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: colors.accent + "22" }]}>
            <Text style={[styles.typeText, { color: colors.accent, fontFamily: "Inter_500Medium" }]}>
              {item.type || "Project"}
            </Text>
          </View>
          {(item.externalLink || item.embedUrl) ? (
            <Feather name="external-link" size={14} color={colors.mutedForeground} />
          ) : null}
        </View>
        <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.description ? (
          <Text style={[styles.cardDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function PortfolioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: items, isLoading, refetch } = usePortfolioItems();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>Portfolio</Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Past work & projects</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : !items || items.length === 0 ? (
        <View style={styles.center}>
          <Feather name="grid" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>No portfolio items yet</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 20 }}
          showsVerticalScrollIndicator={false}
          refreshing={false}
          onRefresh={refetch}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
          renderItem={({ item }) => <PortfolioCard item={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 28 },
  headerSub: { fontSize: 13, marginTop: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyText: { fontSize: 15 },
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  cardImage: { width: "100%", height: 180 },
  cardImagePlaceholder: { width: "100%", height: 140, alignItems: "center", justifyContent: "center" },
  cardBody: { padding: 16, gap: 8 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  typeBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  typeText: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  cardTitle: { fontSize: 16 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
});
