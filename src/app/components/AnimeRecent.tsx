import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState, memo, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import Loader from "@/components/Loader";
import { getHome, OngoingAnime } from "@/services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2.3;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface AnimeCardProps {
  item: OngoingAnime;
  onPress: () => void;
}

const AnimeCard = memo(({ item, onPress }: AnimeCardProps) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
    <Image
      source={{ uri: item.poster }}
      style={{ width: "100%", height: "70%" }}
      contentFit="cover"
    />

    <View style={styles.info}>
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>
      <View style={styles.meta}>
        <View style={styles.epBadge}>
          <Text style={styles.epText}>Ep {item.episodes}</Text>
        </View>
        <Text style={styles.latestReleaseDate} numberOfLines={1}>
          {item.releaseDay}, {item.latestReleaseDate}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
));

export default function AnimeRecent() {
  const router = useRouter();
  const [animeList, setAnimeList] = useState<OngoingAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const home = await getHome();
      setAnimeList(home.ongoing.animeList);
    } catch (err) {
      console.error("[AnimeRecent] Gagal fetch:", err);
    } finally {
      setLoading(false);
    }
  }

  const handlePress = useCallback(
    (animeId: string) => () => router.push(`/detail/${animeId}`),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: OngoingAnime }) => (
      <AnimeCard item={item} onPress={handlePress(item.animeId)} />
    ),
    [handlePress],
  );

  const keyExtractor = useCallback((item: OngoingAnime) => item.animeId, []);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Anime Update</Text>
        <TouchableOpacity
          style={styles.scheduleBtn}
          onPress={() => router.push("/schedule")}
          activeOpacity={0.8}
        >
          <Text style={styles.scheduleBtnText}>Lihat Jadwal</Text>
          <Icon name="ChevronRight" size={14} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.skeletonRow}>
          <Loader visible={loading} />
        </View>
      ) : (
        <FlatList
          data={animeList}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          snapToInterval={CARD_WIDTH + 12}
          decelerationRate="fast"
          removeClippedSubviews
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  scheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  scheduleBtnText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 12,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.secondary,
  },
  info: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 6,
    gap: 6,
  },
  title: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  epBadge: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  epText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  latestReleaseDate: {
    color: colors.textDark,
    fontSize: 10,
    fontWeight: "500",
    flex: 1,
  },
  skeletonRow: {
    height: CARD_HEIGHT,
  },
});
