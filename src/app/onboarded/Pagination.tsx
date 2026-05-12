import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  Extrapolation,
  SharedValue,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from "react-native-reanimated";

import { OnBoardingData } from "@/constants/onboarding";

type DotProps = {
  index: number;
  buttonVal: SharedValue<number>;
};

type PaginationProps = {
  data: OnBoardingData[];
  buttonVal: SharedValue<number>;
};

function Dot({ index, buttonVal }: DotProps) {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();

  const animatedDotStyle = useAnimatedStyle(() => {
    const widthAnimation = interpolate(
      buttonVal.value,
      [
        (index - 1) * SCREEN_HEIGHT,
        index * SCREEN_HEIGHT,
        (index + 1) * SCREEN_HEIGHT,
      ],
      [10, 30, 10],
      Extrapolation.CLAMP,
    );

    const opacityAnimation = interpolate(
      buttonVal.value,
      [
        (index - 1) * SCREEN_HEIGHT,
        index * SCREEN_HEIGHT,
        (index + 1) * SCREEN_HEIGHT,
      ],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP,
    );

    return {
      width: widthAnimation,
      opacity: opacityAnimation,
    };
  });

  const animatedColor = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      buttonVal.value,
      [0, SCREEN_HEIGHT, 2 * SCREEN_HEIGHT, 3 * SCREEN_HEIGHT],
      ["#F2C4CE", "#C9B8D4", "#A8C8D8", "#EDE8F0"],
    );

    return { backgroundColor };
  });

  return (
    <Animated.View style={[styles.dots, animatedDotStyle, animatedColor]} />
  );
}

export default function Pagination({ data, buttonVal }: PaginationProps) {
  return (
    <View style={styles.paginationContainer}>
      {data.map((_, index) => {
        return <Dot index={index} buttonVal={buttonVal} key={index} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 50,
  },
  dots: {
    height: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
});
