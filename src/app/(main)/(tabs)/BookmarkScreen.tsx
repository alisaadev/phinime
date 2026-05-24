import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useEffect, useState, useCallback, memo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
} from "react-native";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import Loader from "@/components/Loader";
import Header from "@/components/Header";
import {
  getBookmarks,
  removeBookmark,
  clearBookmarks,
  Bookmark,
} from "@/services/bookmark";

const { width: SCREEN_WIDTH, height } = Dimensions.get("window");
const PADDING = 16;
const GAP = 6;
const CARD_WIDTH = (SCREEN_WIDTH - PADDING * 2 - GAP * 2) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface CardProps {
  item: Bookmark;
  onPress: (item: Bookmark) => void;
  onLongPress: (item: Bookmark) => void;
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

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.anime_title}
        </Text>
        {!!item.score && (
          <View style={styles.score}>
            <View style={styles.scoreRow}>
              <Icon name="Star" size={10} color="#f5c518" />
              <Text style={styles.scoreText}>{item.score}</Text>
            </View>
            {!!item.status && (
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default function BookmarkScreen() {
  const router = useRouter();
  const scroll = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<FlatList>(null);
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
      <Header title="bookmark" scroll={scroll} />
      <View style={styles.headerRight}>
        {bookmarks.length > 0 && (
          <Text style={styles.countText}>{bookmarks.length} anime</Text>
        )}
        <TouchableOpacity onPress={handleClearAll} activeOpacity={0.8}>
          <Text style={styles.clearBtn}>Hapus semua</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <Loader visible={loading} />
        </View>
      ) : (
        <Animated.FlatList
          ref={scrollRef}
          data={loading ? [] : bookmarks}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  headerRight: {
    zIndex: 99,
    position: "absolute",
    top: 12,
    right: PADDING,
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
    marginTop: 56,
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
  score: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text,
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
