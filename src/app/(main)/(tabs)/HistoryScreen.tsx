import { useRouter } from "expo-router";
import { useRef, useEffect, useState, useCallback, memo } from "react";
import {
  View,
  StyleSheet,
  SectionList,
  Dimensions,
  Animated,
} from "react-native";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import Loader from "@/components/Loader";
import Header from "@/components/Header";
import AnimeCard from "@/components/AnimeCard";
import {
  getWatchHistory,
  getProgressPercent,
  isWatched,
  WatchHistory,
} from "@/services/history";

const { width: SCREEN_WIDTH, height } = Dimensions.get("window");
const PADDING = 16;
const GAP = 6;
const CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface CardProps {
  item: WatchHistory;
  onPress: (item: WatchHistory) => void;
}

interface RowProps {
  items: WatchHistory[];
  onPress: (item: WatchHistory) => void;
}

interface HistorySection {
  title: string;
  data: WatchHistory[][];
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

function groupByDay(list: WatchHistory[]): HistorySection[] {
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

function EmptyState() {
  return (
    <View style={styles.emptyWrapper}>
      <Icon name="History" size={64} color={colors.accent} />
      <Text style={styles.emptyTitle}>Belum ada history</Text>
      <Text style={styles.emptySubtitle}>
        Untaian kisah yang kaudambakan akan terlahir di sini, tepat di hadapan
        matamu.
      </Text>
    </View>
  );
}

const HistoryCard = memo(({ item, onPress }: CardProps) => {
  const percent = getProgressPercent(item);
  const watched = isWatched(item);
  const watchedAt = new Date(item.watched_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <View style={styles.cardWrapper}>
      <AnimeCard
        title={item.anime_title}
        poster={item.poster ?? ""}
        score={`${percent}%`}
        eps={item.ep_title}
        subTitle={watched ? `Selesai • ${watchedAt}` : watchedAt}
        onPress={() => onPress(item)}
      />
      {watched && (
        <View style={styles.watchedBadge}>
          <Icon name="Check" size={12} color="#fff" />
        </View>
      )}
    </View>
  );
});

const HistoryRow = memo(({ items, onPress }: RowProps) => (
  <View style={styles.row}>
    {items.map((item) => (
      <HistoryCard key={item.episode_id} item={item} onPress={onPress} />
    ))}

    {items.length < 3 &&
      [...Array(3 - items.length)].map((_, i) => (
        <View key={`placeholder-${i}`} style={styles.cardPlaceholder} />
      ))}
  </View>
));

export default function HistoryScreen() {
  const router = useRouter();
  const scroll = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<SectionList<WatchHistory[], HistorySection>>(null);
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
      router.push(`/watch/${item.anime_id}` as any);
    },
    [router],
  );

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
      <HistoryRow items={item} onPress={handlePress} />
    ),
    [handlePress],
  );

  const keyExtractor = useCallback(
    (_: WatchHistory[], index: number) => `row-${index}`,
    [],
  );

  return (
    <View style={styles.container}>
      <Header title="history" scroll={scroll} />
      {loading ? (
        <View style={styles.loadingWrapper}>
          <Loader visible={loading} />
        </View>
      ) : (
        <Animated.SectionList
          ref={scrollRef}
          sections={loading ? [] : sections}
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
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scroll } } }],
            { useNativeDriver: false },
          )}
          scrollEventThrottle={16}
          ListEmptyComponent={!loading ? <EmptyState /> : null}
          ListFooterComponent={<View style={{ marginBottom: "24%" }} />}
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
  listContent: {
    paddingHorizontal: PADDING,
    marginBottom: 100,
    marginTop: 60,
  },
  sectionHeader: {
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: "row",
    gap: GAP,
    marginBottom: 16,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    position: "relative",
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
  watchedBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#6FAF4F",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  emptyWrapper: {
    height: height / 1.45,
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
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
