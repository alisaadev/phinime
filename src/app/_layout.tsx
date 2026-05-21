import { useEffect } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    "Circular-Regular": require("@/fonts/Circular-Regular.ttf"),
    "Circular-Medium": require("@/fonts/Circular-Medium.ttf"),
    "Circular-SemiBold": require("@/fonts/Circular-SemiBold.ttf"),
    "Circular-Bold": require("@/fonts/Circular-Bold.ttf"),
    "Circular-ExtraBold": require("@/fonts/Circular-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
