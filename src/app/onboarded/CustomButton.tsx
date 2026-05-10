import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableWithoutFeedback, useWindowDimensions } from "react-native";
import Animated, { SharedValue, interpolateColor, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";

type Props = {
  handlePress: () => void;
  buttonVal: SharedValue<number>;
};

export default function CustomButton({ handlePress, buttonVal }: Props) {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();

  const animatedColor = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      buttonVal.value,
      [0, SCREEN_HEIGHT, 2 * SCREEN_HEIGHT, 3 * SCREEN_HEIGHT],
      ["#F2C4CE", "#C9B8D4", "#A8C8D8", "#EDE8F0"]
    );

    return { backgroundColor };
  });

  const buttonAnimationStyle = useAnimatedStyle(() => {
    return {
      width: buttonVal.value === 3 * SCREEN_HEIGHT ? withSpring(260) : withSpring(100),
      height: buttonVal.value === 3 * SCREEN_HEIGHT ? withSpring(80) : withSpring(100),
    };
  });

  const arrowAnimationStyle = useAnimatedStyle(() => {
    return {
      left: 3,
      opacity: buttonVal.value === 3 * SCREEN_HEIGHT ? withTiming(0) : withTiming(1),
      transform: [{
        translateX: buttonVal.value === 3 * SCREEN_HEIGHT ? withTiming(100) : withTiming(0)
      }]
    };
  });

  const textAnimationStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonVal.value === 3 * SCREEN_HEIGHT ? withTiming(1) : withTiming(0),
      transform: [{
        translateX: buttonVal.value === 3 * SCREEN_HEIGHT ? withTiming(0) : withTiming(-100)
      }]
    };
  });

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View
        style={[styles.container, animatedColor, buttonAnimationStyle]}>
        <Animated.Text style={[styles.textButton, textAnimationStyle]}>
          Ayo Mulai
        </Animated.Text>
        <Animated.View style={arrowAnimationStyle}>
          <Ionicons name="chevron-forward-outline" size={50} color="white" />
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 80,
    zIndex: 1,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center"
  },
  textButton: {
    color: "black",
    fontSize: 18,
    position: "absolute",
    fontFamily: "Montserrat-ExtraBold",
  }
});
