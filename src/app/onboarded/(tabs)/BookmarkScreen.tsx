import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, useCallback, memo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import {
  getBookmarks,
  removeBookmark,
  clearBookmarks,
  Bookmark,
} from "@/services/bookmark";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PADDING = 16;
const GAP = 10;
const CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface CardProps {
  item: Bookmark;
  onPress: (item: Bookmark) => void;
  onLongPress: (item: Bookmark) => void;
}

function SkeletonGrid() {
  return (
    <View style={styles.skeletonWrapper}>
      {[...Array(2)].map((_, i) => (
        <View key={i} style={styles.skeletonCard} />
      ))}
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyWrapper}>
      <Icon name="Bookmark" size={64} color={colors.accent} />
      <Text style={styles.emptyTitle}>Belum ada bookmark</Text>
      <Text style={styles.emptySubtitle}>
        Simpan kisah favoritmu di sini, agar selalu dekat di pelukanmu saat
        kaucari nanti.
      </Text>
    </View>
  );
}

const BookmarkCard = memo(({ item, onPress, onLongPress }: CardProps) => {
  const statusColor =
    item.status?.toLowerCase().includes("ongoing") ||
    item.status?.toLowerCase().includes("airing")
      ? "#A78BFA"
      : "#6EE7B7";

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

      <LinearGradient
        colors={["transparent", colors.secondary]}
        style={styles.overlay}
      />

      {!!item.status && (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusColor + "33", borderColor: statusColor },
          ]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.status}
          </Text>
        </View>
      )}

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.anime_title}
        </Text>
        {!!item.score && (
          <View style={styles.scoreRow}>
            <Text style={styles.scoreStar}>⭐</Text>
            <Text style={styles.scoreText}>{item.score}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default function BookmarkScreen() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    initUser();
  }, []);

  async function initUser() {
    const { data } = await supabase.auth.getUser();
    const uid = data.user?.id ?? null;
    setUserId(uid);
    if (uid) await fetchBookmarks(uid);
    setLoading(false);
  }

  async function fetchBookmarks(uid: string) {
    const list = await getBookmarks(uid);
    setBookmarks(list);
  }

  const handlePress = useCallback(
    (item: Bookmark) => {
      router.push(`/detail/${item.anime_id}`);
    },
    [router],
  );

  const handleLongPress = useCallback(
    (item: Bookmark) => {
      Alert.alert(
        "Hapus Bookmark",
        `Hapus "${item.anime_title}" dari bookmark?`,
        [
          { text: "Batal", style: "cancel" },
          {
            text: "Hapus",
            style: "destructive",
            onPress: async () => {
              if (!userId) return;
              await removeBookmark(userId, item.anime_id);
              await fetchBookmarks(userId);
            },
          },
        ],
      );
    },
    [userId],
  );

  const handleClearAll = useCallback(() => {
    Alert.alert(
      "Hapus Semua Bookmark",
      "Yakin ingin menghapus semua bookmark?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus Semua",
          style: "destructive",
          onPress: async () => {
            if (!userId) return;
            await clearBookmarks(userId);
            setBookmarks([]);
          },
        },
      ],
    );
  }, [userId]);

  const renderItem = useCallback(
    ({ item }: { item: Bookmark }) => (
      <BookmarkCard
        item={item}
        onPress={handlePress}
        onLongPress={handleLongPress}
      />
    ),
    [handlePress, handleLongPress],
  );

  const keyExtractor = useCallback((item: Bookmark) => item.anime_id, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.pill}>
          <View style={styles.pillContent}>
            <Text style={styles.headerTitle}>Bookmark</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {bookmarks.length > 0 && (
            <Text style={styles.countText}>{bookmarks.length} anime</Text>
          )}
          <TouchableOpacity onPress={handleClearAll} activeOpacity={0.8}>
            <Text style={styles.clearBtn}>Hapus semua</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <SkeletonGrid />
      ) : bookmarks.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={bookmarks}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    zIndex: 10,
    height: 56,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: PADDING,
  },
  pill: {
    height: 40,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
  },
  pillContent: {
    paddingHorizontal: 17,
    gap: 8,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  countText: {
    fontSize: 11,
    color: colors.textDark,
    fontWeight: "500",
  },
  clearBtn: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accent,
  },
  listContent: {
    paddingHorizontal: PADDING,
    paddingBottom: 100,
    gap: GAP,
  },
  row: {
    gap: GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.secondary,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  statusBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "700",
  },
  cardInfo: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    gap: 4,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 16,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  scoreStar: {
    fontSize: 10,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
  },
  skeletonWrapper: {
    flexDirection: "row",
    paddingHorizontal: PADDING,
    gap: GAP,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    marginBottom: GAP,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
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
