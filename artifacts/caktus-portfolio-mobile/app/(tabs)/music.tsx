import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAudioTracks } from "@/hooks/useSiteData";
import { storageUrl, type AudioTrack } from "@/lib/api";

function PlayerRow({
  track,
  isCurrentTrack,
  onPress,
}: {
  track: AudioTrack;
  isCurrentTrack: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.trackRow,
        {
          backgroundColor: isCurrentTrack ? colors.primary + "18" : colors.card,
          borderColor: isCurrentTrack ? colors.primary + "55" : colors.border,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <View style={[styles.trackIconBox, { backgroundColor: colors.primary + "22" }]}>
        <Feather
          name={isCurrentTrack ? "pause" : "play"}
          size={18}
          color={colors.primary}
        />
      </View>
      <View style={styles.trackInfo}>
        <Text
          style={[styles.trackTitle, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}
          numberOfLines={1}
        >
          {track.title}
        </Text>
        <Text
          style={[styles.trackGenre, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}
        >
          {track.genre || track.description || "Track"}
        </Text>
      </View>
      {isCurrentTrack && (
        <View style={[styles.playingDot, { backgroundColor: colors.primary }]} />
      )}
    </Pressable>
  );
}

export default function MusicScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: tracks, isLoading, refetch } = useAudioTracks();

  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const player = useAudioPlayer(currentUrl ? { uri: currentUrl } : null);
  const status = useAudioPlayerStatus(player);

  async function handlePress(track: AudioTrack) {
    if (!track.audioUrl) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = storageUrl(track.audioUrl);

    if (currentId === track.id) {
      if (playing) {
        player.pause();
        setPlaying(false);
      } else {
        player.play();
        setPlaying(true);
      }
      return;
    }

    setCurrentUrl(url);
    setCurrentId(track.id);
    setPlaying(true);
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 16,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Music
        </Text>
        <Text style={[styles.headerSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          Listen to my work
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : !tracks || tracks.length === 0 ? (
        <View style={styles.center}>
          <Feather name="music" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            No tracks yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(t) => String(t.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 20 }}
          showsVerticalScrollIndicator={false}
          refreshing={false}
          onRefresh={refetch}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <PlayerRow
              track={item}
              isCurrentTrack={currentId === item.id}
              onPress={() => handlePress(item)}
            />
          )}
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
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  trackIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 15 },
  trackGenre: { fontSize: 12, marginTop: 2 },
  playingDot: { width: 8, height: 8, borderRadius: 4 },
});
