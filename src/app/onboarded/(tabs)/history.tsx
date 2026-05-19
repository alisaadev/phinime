import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback, memo } from "react";
import {
  View,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import {
  getWatchHistory,
  deleteWatchHistory,
  clearWatchHistory,
  getProgressPercent,
  isWatched,
  WatchHistory,
} from "@/services/history";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PADDING = 12;
const GAP = 6;
const CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface CardProps {
  item: WatchHistory;
  onPress: (item: WatchHistory) => void;
  onLongPress: (item: WatchHistory) => void;
}

interface RowProps {
  items: WatchHistory[];
  onPress: (item: WatchHistory) => void;
  onLongPress: (item: WatchHistory) => void;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function groupByDay(
  list: WatchHistory[],
): { title: string; data: WatchHistory[][] }[] {
  const map = new Map<string, WatchHistory[]>();
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  list.forEach((item) => {
    const date = new Date(item.watched_at);
    let label: string;

    if (isSameDay(date, today)) {
      label = "Hari ini";
    } else if (isSameDay(date, yesterday)) {
      label = "Kemarin";
    } else {
      label = date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(item);
  });

  return Array.from(map.entries()).map(([title, items]) => ({
    title,
    data: chunkArray(items, 3),
  }));
}

function SkeletonGrid() {
  return (
    <View style={styles.skeletonWrapper}>
      {[...Array(2)].map((_, si) => (
        <View key={si} style={{ marginBottom: 20 }}>
          <View style={styles.skeletonLabel} />
          <View style={styles.row}>
            {[...Array(3)].map((_, i) => (
              <View key={i} style={styles.skeletonCard} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyWrapper}>
      <Icon name="History" size={64} color={colors.textDark} />
      <Text style={styles.emptyTitle}>Belum ada history</Text>
      <Text style={styles.emptySubtitle}>
        Anime yang kamu tonton akan muncul di sini
      </Text>
    </View>
  );
}

const HistoryCard = memo(({ item, onPress, onLongPress }: CardProps) => {
  const percent = getProgressPercent(item);
  const watched = isWatched(item);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress(item)}
    >
      <Image
        source={{ uri: item.poster ?? undefined }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />

      <View style={styles.overlay} />
      {watched && (
        <View style={styles.watchedBadge}>
          <Icon name="Check" size={10} color="#fff" />
        </View>
      )}

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.anime_title}
        </Text>
        <Text style={styles.cardEp} numberOfLines={1}>
          {item.ep_title}
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%` }]} />
      </View>
    </TouchableOpacity>
  );
});

const HistoryRow = memo(({ items, onPress, onLongPress }: RowProps) => (
  <View style={styles.row}>
    {items.map((item) => (
      <HistoryCard
        key={item.episode_id}
        item={item}
        onPress={onPress}
        onLongPress={onLongPress}
      />
    ))}
    {items.length < 3 &&
      [...Array(3 - items.length)].map((_, i) => (
        <View key={`placeholder-${i}`} style={styles.cardPlaceholder} />
      ))}
  </View>
));

export default function HistoryScreen() {
  const router = useRouter();
  const [sections, setSections] = useState<
    { title: string; data: WatchHistory[][] }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    initUser();
  }, []);

  async function initUser() {
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id ?? null;
    setUserId(uid);
    if (uid) await fetchHistory(uid);
    setLoading(false);
  }

  async function fetchHistory(uid: string) {
    const list = await getWatchHistory(uid);
    setSections(groupByDay(list));
  }

  const handlePress = useCallback(
    (item: WatchHistory) => {
      // Nanti disesuaikan ke halaman watch
      router.push(`/watch/${item.episode_id}`);
    },
    [router],
  );

  const handleLongPress = useCallback(
    (item: WatchHistory) => {
      Alert.alert("Hapus History", `Hapus "${item.ep_title}" dari history?`, [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            if (!userId) return;
            await deleteWatchHistory(userId, item.episode_id);
            await fetchHistory(userId);
          },
        },
      ]);
    },
    [userId],
  );

  const handleClearAll = useCallback(() => {
    Alert.alert(
      "Hapus Semua History",
      "Yakin ingin menghapus semua history tontonan?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus Semua",
          style: "destructive",
          onPress: async () => {
            if (!userId) return;
            await clearWatchHistory(userId);
            setSections([]);
          },
        },
      ],
    );
  }, [userId]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
      </View>
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: WatchHistory[] }) => (
      <HistoryRow
        items={item}
        onPress={handlePress}
        onLongPress={handleLongPress}
      />
    ),
    [handlePress, handleLongPress],
  );

  const keyExtractor = useCallback(
    (_: WatchHistory[], index: number) => `row-${index}`,
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        {sections.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7}>
            <Text style={styles.clearBtn}>Hapus semua</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <SkeletonGrid />
      ) : sections.length === 0 ? (
        <EmptyState />
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          removeClippedSubviews
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: PADDING,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  clearBtn: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accent,
  },
  listContent: {
    paddingHorizontal: PADDING,
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textDark,
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: "row",
    gap: GAP,
    marginBottom: GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.secondary,
  },
  cardPlaceholder: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    backgroundColor: "rgba(0,0,0,0)",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  watchedBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  cardInfo: {
    position: "absolute",
    bottom: 8,
    left: 6,
    right: 6,
  },
  cardTitle: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 13,
  },
  cardEp: {
    fontSize: 8,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  progressTrack: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  skeletonWrapper: {
    paddingHorizontal: PADDING,
    marginTop: 8,
  },
  skeletonLabel: {
    width: 80,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    marginBottom: 10,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 10,
    backgroundColor: colors.secondary,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textDark,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
});
