import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
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
import AnimeCard from "@/components/AnimeCard";
import { getHome, OngoingAnime } from "@/services/otakudesu";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2.3;

export default function AnimeRecent() {
  const router = useRouter();
  const [animeList, setAnimeList] = useState<OngoingAnime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await getHome();
      setAnimeList(res.ongoing.animeList);
    } catch (err) {
      console.error("[AnimeRecent] Gagal fetch:", err);
    } finally {
      setLoading(false);
    }
  }

  const handlePress = useCallback(
    (animeId: string) => () => router.push(`/detail/${animeId}` as any),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: OngoingAnime }) => (
      <AnimeCard
        title={item.title}
        poster={item.poster}
        eps={`Ep ${item.episodes}`}
        subTitle={`${item.releaseDay}, ${item.latestReleaseDate}`}
        onPress={handlePress(item.animeId)}
      />
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
          onPress={() => router.push("/anime-list/schedule")}
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
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  scheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  scheduleBtnText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  skeletonRow: {
    height: CARD_WIDTH,
  },
});
