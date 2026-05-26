import { useRef, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Animated,
  RefreshControl,
  ScrollView,
} from "react-native";

import colors from "@/constants/colors";
import GenreList from "@/components/GenreList";
import AnimeTop from "@/components/AnimeTop";
import HomeHeader from "@/components/HomeHeader";
import AnimeRecent from "@/components/AnimeRecent";
import AnimeCompleted from "@/components/AnimeCompleted";
import UserProfileHome from "@/components/UserProfileHome";

export default function Home() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setRefreshKey((prev) => prev + 1);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      <HomeHeader scrollY={scrollY} />
      <Animated.ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.secondary}
          />
        }
      >
        <AnimeTop key={`top-${refreshKey}`} />
        <View style={styles.barrier} />

        <UserProfileHome />
        <View style={styles.barrier} />

        <GenreList key={`genre-${refreshKey}`} />
        <View style={styles.barrier} />

        <AnimeRecent key={`recent-${refreshKey}`} />
        <View style={styles.barrier} />

        <AnimeCompleted key={`completed-${refreshKey}`} />
        <View style={styles.barrier} />

        <View style={styles.padding} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  barrier: {
    width: "100%",
    marginBottom: 14,
  },
  padding: {
    marginBottom: "24%",
  },
});
