import { Image, StyleSheet, View, useWindowDimensions } from "react-native";

import Text from "@/components/Text";
import { OnBoardingData } from "@/constants/onboarding";

type Props = {
  item: OnBoardingData;
};

export default function RenderItem({ item }: Props) {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  return (
    <View
      style={[
        styles.container,
        {
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          backgroundColor: item.backgroundColor,
        },
      ]}>
      <View style={styles.container2}>
        <Image style={styles.image} source={item.image} />
        <Text style={[styles.itemText, {color: item.textColor}]}>
          {item.text}
        </Text>
        <Text style={[styles.itemText2, {color: item.textColor}]}>
          {item.text2}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center"
  },
  container2: {
    alignItems: "center",
    marginTop: 144
  },
  image: {
    width: 250,
    height: 250,
  },
  itemText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 26,
    fontWeight: "bold",
    marginHorizontal: 20
  },
  itemText2: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    marginHorizontal: 20
  }
});
