import { BlurView } from "expo-blur";
import { useRef, useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
} from "react-native";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";

const ITEMS = [
  { icon: "House" },
  { icon: "History" },
  { icon: "Bookmark" },
  { icon: "User" },
];

interface NavbarProps {
  selectedIndex: number;
  onSelect: (index: number) => void;
  blurTargetRef: React.RefObject<View | null>;
}

export default function Navbar({
  selectedIndex,
  onSelect,
  blurTargetRef,
}: NavbarProps) {
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
    const color = active ? colors.accent : colors.textSecondary;
    return <Icon name={item.icon} size={26} color={color} />;
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container} onLayout={onLayout}>
        <BlurView
          style={StyleSheet.absoluteFillObject}
          blurTarget={blurTargetRef}
          intensity={60}
          tint="systemUltraThinMaterialDark"
          blurMethod="dimezisBlurView"
        />

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
    bottom: 14,
    width: "100%",
    alignItems: "center",
    zIndex: 99,
  },
  container: {
    width: "88%",
    height: 68,
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
    overflow: "hidden",
  },
  activeBubble: {
    position: "absolute",
    height: 62,
    left: 2.5,
    borderRadius: 36,
    backgroundColor: "rgba(26,26,41,0.5)",
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
});
