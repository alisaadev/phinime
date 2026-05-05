import { useRouter } from "expo-router";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Animated, TextInput, TouchableOpacity, ToastAndroid, Keyboard } from "react-native";

import colors from "@/constants/colors";

type Props = {
  scrollY: Animated.Value;
};

export default function HomeHeader({ scrollY }: Props) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);

  const searchWidth = useRef(new Animated.Value(0)).current;
  const searchOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(1)).current;

  const handleSearch = () => {
    if (query === "") {
      ToastAndroid.show("Anime apa yang ingin kamu cari?...", ToastAndroid.SHORT);
    } else if (query.trim() === "") {
      ToastAndroid.show("Anime apa yang ingin kamu cari?...", ToastAndroid.SHORT);
    } else {
      router.push(`search/${query.trim()}`);
    }
  };

  const backgroundColor = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ["transparent", colors.background],
    extrapolate: "clamp",
  });

  const shadowOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 0.3],
    extrapolate: "clamp",
  });

  const openSearch = () => {
    setSearchOpen(true);
    Animated.parallel([
      Animated.spring(searchWidth, {
        toValue: 1,
        useNativeDriver: false,
        friction: 8,
      }),
      Animated.timing(searchOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start(() => inputRef.current?.focus());
  };

  const closeSearch = () => {
    Keyboard.dismiss();
    setQuery("");
    Animated.parallel([
      Animated.spring(searchWidth, {
        toValue: 0,
        useNativeDriver: false,
        friction: 8,
      }),
      Animated.timing(searchOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => setSearchOpen(false));
  };

  const animatedWidth = searchWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "85%"],
  });

  return (
    <Animated.View style={[styles.header, { backgroundColor, shadowOpacity }]}>
      <Animated.Text style={[styles.logo, { opacity: logoOpacity }]}>
        PhiNime
      </Animated.Text>

      {searchOpen && (
        <Animated.View
          style={[
            styles.searchContainer,
            { width: animatedWidth, opacity: searchOpacity },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={16}
            color="rgba(255,255,255,0.5)"
          />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Cari anime..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={query}
            onChangeText={(text) => { setQuery(text) }}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery("") }}>
              <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

      <TouchableOpacity
        onPress={searchOpen ? closeSearch : openSearch}
        style={styles.iconButton}
        activeOpacity={0.7}
      >
        <Ionicons
          name={searchOpen ? "close-outline" : "search-outline"}
          size={24}
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
    left: 0,
    right: 0,
    zIndex: 10,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20
  },
  logo: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0.5,
    position: "absolute",
    left: 20
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
    overflow: "hidden"
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 0
  },
  iconButton: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    width: 40,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: colors.secondary,
    right: 20
  }
});