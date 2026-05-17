import { useRef, useEffect, useState } from "react";
import { House, History, Bookmark, User } from "lucide-react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from "react-native";

import Text from "@/components/Text";
import colors from "@/constants/colors";

const ITEMS = [
  { label: "Home", icon: "house" },
  { label: "History", icon: "history" },
  { label: "Bookmark", icon: "bookmark" },
  { label: "Profile", icon: "user" },
];

export default function Navbar({ selectedIndex, onSelect }: any) {
  const [navWidth, setNavWidth] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;
  const itemWidth = navWidth / ITEMS.length;

  const scales = useRef(
    ITEMS.map((_, i) => new Animated.Value(i === 0 ? 1.1 : 1)),
  ).current;
  const glows = useRef(
    ITEMS.map((_, i) => new Animated.Value(i === 0 ? 1 : 0)),
  ).current;

  useEffect(() => {
    if (!itemWidth) return;

    Animated.spring(slide, {
      toValue: selectedIndex * itemWidth,
      useNativeDriver: true,
      friction: 7,
      tension: 50,
    }).start();

    ITEMS.forEach((_, i) => {
      Animated.spring(scales[i], {
        toValue: i === selectedIndex ? 1.1 : 1,
        useNativeDriver: true,
        friction: 6,
      }).start();

      Animated.timing(glows[i], {
        toValue: i === selectedIndex ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  }, [selectedIndex, itemWidth]);

  const onLayout = (e: LayoutChangeEvent) => {
    setNavWidth(e.nativeEvent.layout.width);
  };

  const renderIcon = (item: any, index: number) => {
    const active = selectedIndex === index;
    const color = active ? colors.accent : "rgba(255,255,255,0.5)";
    const size = 26;

    const icon = (() => {
      switch (item.lib) {
        case "house":
          return <House size={size} color={color} />;
        case "history":
          return <History size={size} color={color} />;
        case "bookmark":
          return <Bookmark size={size} color={color} />;
        default:
          return <User size={size} color={color} />;
      }
    })();

    return icon;
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container} onLayout={onLayout}>
        {navWidth > 0 && (
          <Animated.View
            style={[
              styles.activeBubble,
              {
                width: itemWidth - 7.2,
                transform: [{ translateX: slide }],
              },
            ]}
          />
        )}

        {ITEMS.map((item, index) => {
          const active = selectedIndex === index;

          return (
            <TouchableOpacity
              key={index}
              style={styles.item}
              onPress={() => onSelect(index)}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.iconWrapper,
                  { transform: [{ scale: scales[index] }] },
                ]}
              >
                {renderIcon(item, index)}
              </Animated.View>
              <Text style={[styles.label, active && styles.activeLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 15,
    width: "100%",
    alignItems: "center",
    zIndex: 99,
  },
  container: {
    width: "88%",
    height: 72,
    backgroundColor: "rgba(40,44,64,0.92)",
    borderRadius: 40,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    overflow: "visible",
  },
  activeBubble: {
    position: "absolute",
    height: 65,
    left: 3,
    borderRadius: 36,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    zIndex: 2,
    height: "100%",
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 8,
    fontWeight: "500",
  },
  activeLabel: {
    color: colors.accent,
    fontSize: 8,
    fontWeight: "700",
  },
});
