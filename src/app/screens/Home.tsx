import { useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

import colors from "@/constants/colors";
import HomeHeader from "@/components/HomeHeader";
import TopAnimeCard from "@/components/TopAnimeCard";

export default function Home() {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      <HomeHeader scrollY={scrollY} />
      <Animated.ScrollView
        style={{ flex: 1 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <TopAnimeCard />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  }
});