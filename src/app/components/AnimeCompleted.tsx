import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, memo } from "react";
import { TouchableOpacity, StyleSheet, View, Dimensions } from "react-native";

import Text from "@/components/Text";
import colors from "@/constants/colors";
import Loader from "@/components/Loader";
import { getAnimeDetail, getHome } from "@/services/api";
import type { AnimeDetail, CompletedAnime } from "@/services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_HEIGHT = (SCREEN_WIDTH - 48) / 2.3;

interface CardData {
  id: CompletedAnime;
  item: AnimeDetail | null;
}

export default function AnimeCompleted() {
  const router = useRouter();
  const [animeList, setAnimeList] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const home = await getHome();
        const list = home.completed.animeList;

        setAnimeList(list.map((id) => ({ id, item: null })));
        list.forEach(async (anime, idx) => {
          try {
            const res = await getAnimeDetail(anime.animeId);

            setAnimeList((prev) => {
              const next = [...prev];
              next[idx] = { id: anime.animeId, item: res };

              return next;
            });
          } catch {
            console.error("[OngoingAnime] Gagal fetch:", err);
          }
        });
      } catch (err) {
        console.error("[OngoingAnime] Gagal fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const AnimeCard = memo(
    ({ item, onPress }: { item: CardData; onPress?: () => void }) => {
      const genres = item?.genreList ?? [];
      const visible = genres.slice(0, 3);
      const extra = genres.length - 3;

      const synopsis = item?.synopsis?.paragraphs?.[0] ?? "";
      const studios = item?.studios ?? "Unknown";
      const score = item?.score ?? "Unknown";

      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={onPress}
        >
          <Image
            source={{ uri: item?.poster }}
            style={{ width: "30%", height: "100%" }}
            contentFit="cover"
          />

          <View style={styles.content}>
            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>{item?.episodes} Eps</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>
                  {item?.status ?? "Unknown"}
                </Text>
              </View>
              <View style={{ flex: 1 }} />
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>
                  {item?.aired ?? "Unknown"}
                </Text>
              </View>
            </View>

            <Text style={styles.title} numberOfLines={1}>
              {item?.title}
            </Text>

            <View style={styles.genreRow}>
              {visible.map((g, i) => (
                <View key={i} style={styles.genreBadge}>
                  <Text style={styles.genreBadgeText}>{g.title}</Text>
                </View>
              ))}
              {extra > 0 && (
                <View style={styles.genreBadge}>
                  <Text style={styles.genreBadgeText}>+{extra}</Text>
                </View>
              )}
            </View>

            <View style={styles.studioRow}>
              {!!studios && <Text style={styles.studio}>{studios}</Text>}
              {!!studios && !!score && <Text style={styles.dot}>{"•"}</Text>}
              {!!score && <Text style={styles.score}>{score}</Text>}
            </View>
            {!!synopsis ? (
              <Text style={styles.synopsis} numberOfLines={3}>
                {synopsis}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    },
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Anime Completed</Text>
        <TouchableOpacity
          style={styles.completedBtn}
          onPress={() => router.push("/completed")}
          activeOpacity={0.8}
        >
          <Text style={styles.completedBtnText}>Lihat semua</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.skeletonRow}>
          <Loader visible={loading} />
        </View>
      ) : (
        animeList.map((item, idx) => (
          <View key={idx}>
            <AnimeCard
              item={item.item}
              onPress={() => router.push(`/detail/${item.id}`)}
            />
            {idx < animeList.length - 1 && <View style={{ height: 12 }} />}
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  completedBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  completedBtnText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    height: CARD_HEIGHT,
    flexDirection: "row",
    backgroundColor: colors.secondary,
    borderRadius: 12,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    padding: 6,
    gap: 4,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
  },
  metaBadge: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  metaBadgeText: {
    fontSize: 8,
    fontWeight: "600",
    color: colors.text,
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 20,
  },
  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  genreBadge: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  genreBadgeText: {
    fontSize: 8,
    fontWeight: "500",
    color: colors.text,
  },
  studioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  studio: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.text,
  },
  dot: {
    fontSize: 12,
    color: colors.text,
  },
  score: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text,
  },
  synopsis: {
    fontSize: 8,
    color: colors.text,
    lineHeight: 17,
  },
  skeletonRow: {
    height: CARD_HEIGHT,
  },
});
