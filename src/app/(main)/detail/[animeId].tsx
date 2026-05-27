import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import Loader from "@/components/Loader";
import Button from "@/components/Button";
import BackButton from "@/components/BackButton";
import AnimeBatch from "@/components/AnimeBatch";

import { getCurrentUser } from "@/services/auth";
import { toggleBookmark, isBookmarked } from "@/services/bookmark";
import { getAnimeDetail, AnimeDetail, EpisodeItem } from "@/services/otakudesu";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const POSTER_HEIGHT = SCREEN_HEIGHT * 0.42;

function EpisodeCard({
  ep,
  onPress,
}: {
  ep: EpisodeItem;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.epCard}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.epNumberBadge}>
        <Text style={styles.epNumber}>{String(ep.eps).padStart(2, "0")}</Text>
      </View>
      <View style={styles.epInfo}>
        <Text style={styles.epTitle} numberOfLines={1}>
          {ep.title}
        </Text>
        <View style={styles.epMeta}>
          <Icon name="Calendar" size={12} color={colors.textSecondary} />
          <Text style={styles.epMetaText}>{ep.date}</Text>
        </View>
      </View>
      <View style={styles.epPlay}>
        <Icon name="Play" size={16} color={colors.accent} />
      </View>
    </TouchableOpacity>
  );
}

function GenreBadge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

export default function DetailAnimeScreen() {
  const router = useRouter();
  const { animeId } = useLocalSearchParams<{ animeId: string }>();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [anime, setAnime] = useState<AnimeDetail | null>(null);

  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchDetail = useCallback(async () => {
    if (!animeId) return;

    try {
      setLoading(true);
      const data = await getAnimeDetail(animeId);
      setAnime(data);

      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
        const isFav = await isBookmarked(user.id, animeId);
        setBookmarked(isFav);
      }
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [animeId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleToggleBookmark = async () => {
    if (!userId || !anime) return;

    const newState = await toggleBookmark({
      user_id: userId,
      anime_id: animeId!,
      anime_title: anime.title,
      poster: anime.poster,
      status: anime.status,
      score: anime.score,
    });

    setBookmarked(newState);
  };

  const headerBgOpacity = scrollY.interpolate({
    inputRange: [POSTER_HEIGHT - 80, POSTER_HEIGHT - 20],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <Loader visible={loading} />
      </View>
    );
  }

  const synopsisText = anime.synopsis.paragraphs.join("\n\n");
  const SYNOPSIS_LINES = synopsisExpanded ? undefined : 4;

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.floatingHeader, { paddingTop: insets.top }]}>
        <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.background, opacity: headerBgOpacity }]} />
        <BackButton />
        <Button
          button={styles.headerBtn}
          onPress={handleToggleBookmark}
        >
          <Icon
            name={bookmarked ? "Bookmark" : "BookmarkPlus"}
            size={20}
            color={bookmarked ? colors.accent : "#fff"}
          />
          <Text
            style={[
              styles.headerBtnLabel,
              bookmarked && { color: colors.accent },
            ]}
          >
            {bookmarked ? "Tersimpan" : "Simpan"}
          </Text>
        </Button>
      </Animated.View>

      <Animated.ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: anime.poster }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            blurRadius={18}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.55)", colors.background]}
            locations={[0.3, 0.7, 1]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.posterWrapper}>
            <Image
              source={{ uri: anime.poster }}
              style={styles.poster}
              contentFit="cover"
            />
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.title}>{anime.title}</Text>
          <Text style={styles.japaneseTitle}>{anime.japanese}</Text>

          <View style={styles.metaRow}>
            {[anime.studios, anime.type, anime.status, anime.aired].map(
              (m, i) => (
                <View key={i} style={styles.metaRow}>
                  {i > 0 && <View style={styles.metaDot} />}
                  <Text style={styles.metaText}>{m}</Text>
                </View>
              ),
            )}
          </View>

          <View style={styles.genreRow}>
            {anime.genreList.map((g) => (
              <GenreBadge key={g.genreId} label={g.title} />
            ))}
          </View>

          <View style={styles.scoreRow}>
            <Icon name="Star" size={22} color="#FBBF24" fill="#FBBF24" />
            <Text style={styles.scoreValue}>{anime.score || "N/A"}</Text>
            <Text style={styles.scoreLabel}>/ 10</Text>
          </View>
        </View>

        <View style={styles.divider} />
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sinopsis</Text>
          <Text style={styles.synopsisText} numberOfLines={SYNOPSIS_LINES}>
            {synopsisText}
          </Text>
          <TouchableOpacity
            style={styles.synopsisToggle}
            onPress={() => setSynopsisExpanded((e) => !e)}
            activeOpacity={0.7}
          >
            <Text style={styles.synopsisToggleText}>
              {synopsisExpanded ? "Sembunyikan" : "Selengkapnya"}
            </Text>
            <Icon
              name={synopsisExpanded ? "ChevronUp" : "ChevronDown"}
              size={16}
              color={colors.accent}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Episode</Text>
            <View style={styles.epCountBadge}>
              <Text style={styles.epCountText}>
                {anime.episodeList.length} Eps
              </Text>
            </View>
          </View>

          {anime.episodeList.map((ep) => (
            <EpisodeCard
              key={ep.episodeId}
              ep={ep}
              onPress={() => {
                router.push(`/watch/${ep.episodeId}` as any);
              }}
            />
          ))}
        </View>

        {anime.batch && (
          <>
            <View style={styles.divider} />
            <AnimeBatch batchId={anime.batch.batchId} />
          </>
        )}
        <View style={{ marginBottom: "24%" }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBtn: {
    flexDirection: "row",
    height: 40,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: colors.secondary,
  },
  headerBtnLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  heroContainer: {
    height: POSTER_HEIGHT,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  posterWrapper: {
    width: SCREEN_WIDTH * 0.46,
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  infoSection: {
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    lineHeight: 28,
  },
  japaneseTitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: -10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 99,
    backgroundColor: colors.textSecondary,
    marginHorizontal: 2,
  },
  genreRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  scoreLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  divider: {
    height: 0.8,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 16,
    marginVertical: 14,
  },
  section: {
    paddingHorizontal: 16,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
  },
  epCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
    backgroundColor: colors.accent + "22",
    borderWidth: 0.8,
    borderColor: colors.accent + "55",
  },
  epCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.accent,
  },
  synopsisText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  synopsisToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  synopsisToggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.accent,
  },
  epCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: 14,
  },
  epNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accent + "18",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: colors.accent + "44",
  },
  epNumber: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.accent,
  },
  epInfo: {
    flex: 1,
    gap: 4,
  },
  epTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  epMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  epMetaText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  epPlay: {
    width: 34,
    height: 34,
    borderRadius: 99,
    backgroundColor: colors.accent + "18",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: colors.accent + "44",
  },
});
