import { useEffect } from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

import colors from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import { cleanExpiredCache } from "@/services/cache";

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const hasOnboarded = await AsyncStorage.getItem("hasOnboarded");
      const { data: { user } } = await supabase.auth.getUser();

      if (!hasOnboarded) {
        router.replace("/onboarding");
      } /*else if (!user) {
        router.replace("/onboarded/login");
      }*/ else {
        router.replace("/onboarded/(tabs)");
      }
    };

    check();
    cleanExpiredCache();
  }, []);

  return null
}