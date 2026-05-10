import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, Animated, TouchableOpacity, ToastAndroid, Keyboard } from "react-native";

import Text from "@/components/Text";
import colors from "@/constants/colors";
import TextInput from "@/components/TextInput";

type Props = {
  scrollY: Animated.Value;
};

export default function HomeHeader({ scrollY }: Props) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<any>(null);

  const pillWidth = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const inputOpacity = useRef(new Animated.Value(0)).current;

  const animatedWidth = pillWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["33%", "85%"],
  });

  const backgroundColor = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ["transparent", colors.background],
    extrapolate: "clamp",
  });

  const openSearch = () => {
    setSearchOpen(true);
    Animated.parallel([
      Animated.spring(pillWidth, {
        toValue: 1,
        useNativeDriver: false,
        friction: 8,
      }),
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(inputOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => inputRef.current?.focus());
  };

  const closeSearch = () => {
    Keyboard.dismiss();
    setQuery("");
    Animated.parallel([
      Animated.spring(pillWidth, {
        toValue: 0,
        useNativeDriver: false,
        friction: 8,
      }),
      Animated.timing(inputOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => setSearchOpen(false));
  };

  const handleSearch = () => {
    if (!query.trim()) {
      ToastAndroid.show("Anime apa yang ingin kamu cari?...", ToastAndroid.SHORT);
    } else {
      router.push(`search/${query.trim()}`);
    }
  };

  return (
    <Animated.View style={[styles.header, { backgroundColor }]}>
      <Animated.View style={[styles.pill, { width: animatedWidth }]}>

        <Animated.View
          style={[StyleSheet.absoluteFill, styles.pillContent, { opacity: textOpacity }]}
          pointerEvents={searchOpen ? "none" : "auto"}
        >
          <Text style={styles.logo}>Phinime</Text>
        </Animated.View>

        <Animated.View
          style={[StyleSheet.absoluteFill, styles.pillContent, { opacity: inputOpacity }]}
          pointerEvents={searchOpen ? "auto" : "none"}
        >
          <Ionicons name="search-outline" size={14} color="rgba(255,255,255,0.5)" />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Cari anime..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={14} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>

      <TouchableOpacity
        onPress={searchOpen ? closeSearch : openSearch}
        style={styles.iconButton}
        activeOpacity={0.7}
      >
        <Ionicons
          name={searchOpen ? "close-outline" : "search-outline"}
          size={22}
          color={colors.text}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    zIndex: 10,
    height: 56,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  pill: {
    height: 40,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
    position: "relative",
  },
  pillContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 8,
  },
  logo: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 0,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: 40,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: colors.secondary,
  },
});