import { View, StyleSheet, Animated } from "react-native";

import Text from "@/components/Text";
import colors from "@/constants/colors";
import Button from "@/components/Button";

type Props = {
  title: String;
  scroll: Animated.Value;
};

export default function Header({ title, scroll }: Props) {
  const backgroundColor = scroll.interpolate({
    inputRange: [0, 100],
    outputRange: ["rgba(26,26,41,0)", colors.background],
    extrapolate: "clamp",
  });

  return (
    <Animated.View style={[styles.header, { backgroundColor }]}>
      <Button title={title} button={styles.pill} text={styles.logo} />
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
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  pill: {
    height: 40,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    paddingHorizontal: 17,
    paddingVertical: 0,
    gap: 8,
  },
  logo: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
