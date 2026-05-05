import { Image } from "expo-image";
import { useRef, useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Animated, NativeScrollEvent, NativeSyntheticEvent } from "react-native";

import colors from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH;
const AUTO_SLIDE_INTERVAL = 3500;

const DUMMY_ANIME = [
  {
    id: "1",
    title: "Solo Leveling Season 2",
    genre: "Action • Fantasy",
    rating: "9.1",
    cover: "https://cdn.myanimelist.net/images/anime/1151/124104.jpg",
  },
  {
    id: "2",
    title: "Dandadan",
    genre: "Action • Comedy • Supernatural",
    rating: "8.7",
    cover: "https://cdn.myanimelist.net/images/anime/1439/142853.jpg",
  },
  {
    id: "3",
    title: "Bleach: Thousand-Year Blood War",
    genre: "Action • Adventure",
    rating: "9.0",
    cover: "https://cdn.myanimelist.net/images/anime/1764/126627.jpg",
  },
  {
    id: "4",
    title: "Mushoku Tensei Season 3",
    genre: "Fantasy • Isekai",
    rating: "8.8",
    cover: "https://cdn.myanimelist.net/images/anime/1020/117005.jpg",
  },
];

function AnimatedDot({ active }: { active: boolean }) {
  const width = useRef(new Animated.Value(active ? 20 : 6)).current;
  const opacity = useRef(new Animated.Value(active ? 1 : 0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(width, {
        toValue: active ? 20 : 6,
        useNativeDriver: false,
        friction: 5
      }),
      Animated.timing(opacity, {
        toValue: active ? 1 : 0.4,
        duration: 250,
        useNativeDriver: false
      })
    ]).start();
  }, [active]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width,
          opacity,
          backgroundColor: active ? colors.accent : "rgba(255,255,255,0.5)",
        }
      ]}
    />
  );
}

export default function TopAnimeCard() {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoSlide = () => {
    autoSlideRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % DUMMY_ANIME.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, AUTO_SLIDE_INTERVAL);
  };

  const stopAutoSlide = () => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIndex(index);
    stopAutoSlide();
    startAutoSlide();
  };

  const renderItem = ({ item }: { item: typeof DUMMY_ANIME[0] }) => (
    <TouchableOpacity activeOpacity={0.9} style={styles.card}>
      <Image
        source={{ uri: item.cover }}
        style={styles.cover}
        contentFit="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(26,26,41,0.8)", "rgba(26,26,41,1)"]}
        locations={[0.2, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.info}>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.genre}>{item.genre}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={DUMMY_ANIME}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH,
          offset: CARD_WIDTH * index,
          index
        })}
      />

      <View style={styles.dots}>
        {DUMMY_ANIME.map((_, i) => (
          <AnimatedDot key={i} active={i === activeIndex} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: SCREEN_WIDTH,
    height: 420
  },
  card: {
    width: CARD_WIDTH,
    height: 420
  },
  cover: {
    width: "100%",
    height: "100%"
  },
  info: {
    position: "absolute",
    bottom: 48,
    left: 20,
    right: 20
  },
  ratingBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(105,140,226,0.5)",
    borderWidth: 0.8,
    borderColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8
  },
  ratingText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "600"
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },
  genre: {
    color: colors.textSecondary,
    fontSize: 13
  },
  dots: {
    position: "absolute",
    bottom: 16,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6
  },
  dot: {
    height: 6,
    borderRadius: 3
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.accent
  }
});