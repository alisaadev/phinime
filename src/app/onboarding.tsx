import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { useSharedValue, withTiming } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  PixelRatio,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Canvas,
  Circle,
  Group,
  Image,
  Mask,
  SkImage,
  makeImageFromView,
} from "@shopify/react-native-skia";

import data from "@/constants/onboarding";
import Pagination from "@/onboarded/Pagination";
import RenderItem from "@/onboarded/RenderItem";
import CustomButton from "@/onboarded/CustomButton";

export default function OnboardingScreen() {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const pd = PixelRatio.get();
  const router = useRouter();
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [overlay, setOverlay] = useState<SkImage | null>(null);
  const mask = useSharedValue(0);
  const buttonVal = useSharedValue(0);
  const wait = async (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handlePress = async () => {
    if (currentIndex === data.length - 1 && !active) {
      await AsyncStorage.setItem("hasOnboarded", "true");
      router.replace("/onboarded/login");
      return;
    }

    if (!active) {
      setActive(true);

      const snapshot1 = await makeImageFromView(ref);
      setOverlay(snapshot1);
      await wait(80);

      setCurrentIndex((prev) => prev + 1);
      mask.value = withTiming(SCREEN_HEIGHT, { duration: 1000 });
      buttonVal.value = withTiming(buttonVal.value + SCREEN_HEIGHT);
      await wait(1000);

      setOverlay(null);
      setActive(false);

      await wait(200);
      mask.value = 0;
    }
  };
  return (
    <View style={styles.container}>
      <View ref={ref} collapsable={false}>
        {data.map((item, index) => {
          return (
            currentIndex === index && <RenderItem item={item} key={index} />
          );
        })}
      </View>

      {overlay && (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents={"none"}>
          <Mask
            mode="luminance"
            mask={
              <Group>
                <Circle
                  cx={SCREEN_WIDTH / 2}
                  cy={SCREEN_HEIGHT - 160}
                  r={SCREEN_HEIGHT}
                  color="white"
                />
                <Circle
                  cx={SCREEN_WIDTH / 2}
                  cy={SCREEN_HEIGHT - 160}
                  r={mask}
                  color="black"
                />
              </Group>
            }
          >
            <Image
              image={overlay}
              x={0}
              y={0}
              width={overlay.width() / pd}
              height={overlay.height() / pd}
            />
          </Mask>
        </Canvas>
      )}

      <CustomButton handlePress={handlePress} buttonVal={buttonVal} />
      <Pagination data={data} buttonVal={buttonVal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
});
