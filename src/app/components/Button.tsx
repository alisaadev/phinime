import { useRef, ReactNode } from "react";
import { Pressable, StyleSheet, Animated, GestureResponderEvent, ViewStyle, TextStyle, StyleProp } from "react-native";

import Text from "@/components/Text";

type ButtonProps = {
  title?: string;
  children?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;

  button?: StyleProp<ViewStyle>;
  text?: StyleProp<TextStyle>;
  wrapper?: StyleProp<ViewStyle>;
};

export default function Button({ title, children, onPress, button, text, wrapper }: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 35,
      bounciness: 8
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.wrapperD,
        wrapper,
        {
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.buttonD, button]}
      >
        {children ? (
          children
        ) : (
          <Text style={[styles.textD, text]}>
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapperD: {
    borderRadius: 999
  },
  buttonD: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  textD: {
    color: "#000",
    fontSize: 16
  }
});