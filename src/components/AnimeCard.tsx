import { Image } from "expo-image";
import { memo } from "react";
import { StyleSheet, View, TouchableOpacity, Dimensions } from "react-native";

import Text from "@/components/Text";
import colors from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const GAP = 8;
const CARD_WIDTH =
  (SCREEN_WIDTH - (32 + (COLUMN_COUNT - 1) * GAP)) / COLUMN_COUNT;

interface AnimeCardProps {
  title: string;
  poster: string;
  eps?: string;
  score?: string;
  subTitle?: string;
  onPress: () => void;
}

const AnimeCard = ({
  title,
  poster,
  eps,
  score,
  subTitle,
  onPress,
}: AnimeCardProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Image
        source={{ uri: poster }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </View>
      <View style={styles.meta}>
        {score && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{score}</Text>
          </View>
        )}
        {eps && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{eps}</Text>
          </View>
        )}
      </View>
      {subTitle && (
        <Text style={styles.subTitle} numberOfLines={1}>
          {subTitle}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default memo(AnimeCard);

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    aspectRatio: 1 / 1.5,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.secondary,
    marginBottom: GAP,
  },
  image: {
    width: "100%",
    height: "70%",
  },
  info: {
    paddingTop: 4,
    paddingHorizontal: 6,
  },
  title: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 14,
  },
  meta: {
    position: "absolute",
    bottom: 56,
    left: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  subTitle: {
    position: "absolute",
    bottom: 6,
    left: 6,
    right: 6,
    color: colors.textDark,
    fontSize: 8,
    fontWeight: "500",
  },
});
