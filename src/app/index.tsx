import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import LottieView from "lottie-react-native";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Text from "@/components/Text";
import colors from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import { cleanExpiredCache } from "@/services/cache";

export default function WelcomeScreen() {
  const router = useRouter();
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, 10000);

    const check = async () => {
      try {
        const [
          hasOnboarded,
          {
            data: { user },
          },
        ] = await Promise.all([
          AsyncStorage.getItem("hasOnboarded"),
          supabase.auth.getUser(),
        ]);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (!hasOnboarded) {
          router.replace("/onboarding");
        } else if (!user) {
          router.replace("/login");
        } else {
          router.replace("/(tabs)");
        }

        cleanExpiredCache();
      } catch (error) {
        console.error("[WelcomeScreen] Initialization error:", error);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    check();

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.logo}>PhiNime</Text>
      <Text style={styles.tagline}>Dunia lain menantimu</Text>

      <View style={styles.bottom}>
        <LottieView
          autoPlay
          loop
          style={{ width: 160, height: 160 }}
          source={require("@/assets/animations/loading.json")}
        />
        {showTimeoutMessage && (
          <Text style={styles.timeoutText}>Sepertinya koneksi mu terputus</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: "500",
    fontStyle: "italic",
  },
  bottom: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
  },
  timeoutText: {
    marginTop: -20,
    fontSize: 12,
    color: colors.textDark,
    fontWeight: "600",
  },
});
