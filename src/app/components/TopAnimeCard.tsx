import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
} from "react-native";

import Text from "@/components/Text";
import colors from "@/constants/colors";
import Button from "@/components/Button";
import { getHome, Top10Item } from "@/services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = 180;
const CARD_GAP = 16;

function Dot({ active }: { active: boolean }) {
  const width = useRef(new Animated.Value(active ? 20 : 6)).current;
  const opacity = useRef(new Animated.Value(active ? 1 : 0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(width, {
        toValue: active ? 20 : 6,
        useNativeDriver: false,
        friction: 5,
      }),
      Animated.timing(opacity, {
        toValue: active ? 1 : 0.4,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  }, [active]);

  return (
    <Animated.View
      style={{
        width,
        opacity,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 3,
        backgroundColor: active ? colors.accent : "rgba(255,255,255,0.4)",
      }}
    />
  );
}

export default function TopAnimeCard() {
  const flatListRef = useRef<FlatList>(null);
  const [animeList, setAnimeList] = useState<Top10Item[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { top10 } = await getHome();
        setAnimeList(top10.animeList);
      } catch (err) {
        console.error("[TopAnimeCard] Gagal fetch:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!isAutoPlay || animeList.length === 0) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = prev >= animeList.length - 1 ? 0 : prev + 1;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlay, animeList]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP),
    );
    setActiveIndex(index);
  };

  if (animeList.length === 0) {
    return (
      <View style={styles.skeletonWrapper}>
        <View style={styles.skeletonCard}>
          <View style={styles.skeletonPoster} />

          <View style={styles.skeletonContent}>
            <View style={styles.skeletonRank} />
            <View style={styles.skeletonTitle} />
            <View style={styles.skeletonTitleShort} />
            <View style={styles.skeletonButton} />
          </View>
        </View>

        <View style={styles.skeletonDots}>
          {[...Array(5)].map((_, i) => (
            <View key={i} style={styles.skeletonDot} />
          ))}
        </View>
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: Top10Item; index: number }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.poster }}
        style={styles.poster}
        contentFit="cover"
      />

      <LinearGradient
        colors={["rgba(26,26,41,0)", colors.secondary]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.35, y: 0 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={["transparent", "rgba(26,26,41,0.5)"]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.rankContainer}>
            <Text style={styles.rankHash}>#</Text>
            <Text style={styles.rankNumber}>{index + 1}</Text>
            <Text style={styles.spotlight}>SPOTLIGHT</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.bottomRow}>
          <Button
            button={styles.watchButton}
            onPress={() => console.log("Watch:", item.animeId)}
          >
            <View style={styles.playIconWrapper}>
              <Ionicons name="play" size={9} color={colors.background} />
            </View>
            <Text style={styles.watchText}>Tonton</Text>
          </Button>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreStar}>⭐</Text>
            <Text style={styles.scoreText}>{item.score}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={animeList}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.rank)}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onMomentumScrollEnd={onScrollEnd}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => setIsAutoPlay(false)}
        onScrollEndDrag={() => setIsAutoPlay(true)}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + CARD_GAP,
          offset: (CARD_WIDTH + CARD_GAP) * index,
          index,
        })}
      />

      <View style={styles.dots}>
        {animeList.map((_, i) => (
          <Dot key={i} active={i === activeIndex} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 56,
  },
  listContent: {
    paddingHorizontal: 24,
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.secondary,
  },
  poster: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "58%",
  },
  content: {
    flex: 1,
    padding: 18,
    justifyContent: "space-between",
    zIndex: 2,
    width: "65%",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  bottomRow: {
    width: "85%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rankContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 1,
  },
  rankHash: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 30,
  },
  rankNumber: {
    color: colors.accent,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 32,
  },
  spotlight: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 4,
    marginLeft: 4,
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(105,140,226,0.15)",
    borderWidth: 0.8,
    borderColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 3,
  },
  scoreStar: {
    fontSize: 10,
  },
  scoreText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  watchButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 6,
  },
  playIconWrapper: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  watchText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
  skeletonWrapper: {
    marginTop: 56,
    paddingHorizontal: 24,
  },
  skeletonCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    overflow: "hidden",
    flexDirection: "row",
  },
  skeletonPoster: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "58%",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  skeletonContent: {
    padding: 18,
    justifyContent: "space-between",
    width: "65%",
  },
  skeletonRank: {
    width: 60,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  skeletonTitle: {
    width: "90%",
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 8,
  },
  skeletonTitleShort: {
    width: "60%",
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  skeletonButton: {
    width: 90,
    height: 32,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  skeletonDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    gap: 6,
  },
  skeletonDot: {
    width: 6,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
});
