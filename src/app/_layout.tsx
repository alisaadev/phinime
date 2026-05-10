import { useEffect } from "react";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [loaded] = useFonts({
    "Montserrat-Regular": require("@/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Medium": require("@/fonts/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("@/fonts/Montserrat-SemiBold.ttf"),
    "Montserrat-Bold": require("@/fonts/Montserrat-Bold.ttf"),
    "Montserrat-ExtraBold": require("@/fonts/Montserrat-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: "slide_from_right"
    }} />
  );
}