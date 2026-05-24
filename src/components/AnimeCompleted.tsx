import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState, memo, useCallback } from "react";
import { TouchableOpacity, StyleSheet, View, Dimensions } from "react-native";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import Loader from "@/components/Loader";
import { getAnimeDetail, getHome } from "@/services/otakudesu";
import type { AnimeDetail, CompletedAnime } from "@/services/otakudesu";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_HEIGHT = (SCREEN_WIDTH - 48) / 2.3;

interface CardData {
  id: string;
  item: AnimeDetail | null;
}

interface AnimeCardProps {
  item: AnimeDetail | null;
  onPress?: () => void;
}

const AnimeCard = memo(({ item, onPress }: AnimeCardProps) => {
  const genres = item?.genreList ?? [];
  const visible = genres.slice(0, 3);
  const extra = genres.length - 3;

  const synopsis = item?.synopsis?.paragraphs?.[0] ?? "";
  const studios = item?.studios ?? "Unknown";
  const score = item?.score ?? "Unknown";

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
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
            <Text style={styles.metaBadgeText}>{item?.aired ?? "Unknown"}</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
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
          {!!score && <Text style={styles.score}>⭐ {score}</Text>}
        </View>

        {!!synopsis && (
          <Text style={styles.synopsis} numberOfLines={3}>
            {synopsis}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default function AnimeCompleted() {
  const router = useRouter();
  const [animeList, setAnimeList] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      const home = await getHome();
      const list: CompletedAnime[] = home.completed.animeList;

      setAnimeList(list.map((anime) => ({ id: anime.animeId, item: null })));

      for (let idx = 0; idx < list.length; idx++) {
        const anime = list[idx];
        try {
          const res = await getAnimeDetail(anime.animeId);
          setAnimeList((prev) => {
            const next = [...prev];
            next[idx] = { id: anime.animeId, item: res };
            return next;
          });
        } catch (err) {
          console.error(
            "[AnimeCompleted] Gagal fetch detail:",
            anime.animeId,
            err,
          );
        }
      }
    } catch (err) {
      console.error("[AnimeCompleted] Gagal fetch home:", err);
    } finally {
      setLoading(false);
    }
  }

  const handlePress = useCallback(
    (id: string) => () => router.push(`/detail/${id}`),
    [router],
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Anime Completed</Text>
        <TouchableOpacity
          style={styles.completedBtn}
          onPress={() => router.push("/anime-list?type=completed")}
          activeOpacity={0.8}
        >
          <Text style={styles.completedBtnText}>Lihat semua</Text>
          <Icon name="ChevronRight" size={14} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {loading && animeList.length === 0 ? (
        <View style={styles.skeletonRow}>
          <Loader visible={loading} />
        </View>
      ) : (
        animeList.map((card, idx) => (
          <View key={card.id}>
            <AnimeCard item={card.item} onPress={handlePress(card.id)} />
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
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  completedBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  completedBtnText: {
    color: colors.accent,
    fontSize: 10,
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
    gap: 6,
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
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 18,
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
    color: colors.textSecondary,
  },
  dot: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  score: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  synopsis: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  skeletonRow: {
    height: CARD_HEIGHT,
  },
});
