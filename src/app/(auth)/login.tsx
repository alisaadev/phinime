import { useState } from "react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { View, StyleSheet, Pressable, ToastAndroid } from "react-native";

import Text from "@/components/Text";
import colors from "@/constants/colors";
import Loader from "@/components/Loader";
import Button from "@/components/Button";
import { signInWithGoogle } from "@/services/auth";

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    const result = await signInWithGoogle();
    setLoading(false);

    if (result.success) {
      router.replace("/(main)/(tabs)");
      ToastAndroid.show(
        "Berhasil Login dengan Akun " + result.user?.email,
        ToastAndroid.SHORT,
      );
    } else {
      ToastAndroid.show(typeof result.error === "string" ? result.error : "An error occurred", ToastAndroid.SHORT);
      console.error(result.error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Masuk untuk melanjutkan menonton</Text>

        <Button
          button={styles.googleButton}
          wrapper={styles.containerButton}
          onPress={handleGoogle}
        >
          <Image
            source={require("@/assets/images/GoogleIcon.png")}
            style={styles.googleIcon}
            contentFit="cover"
          />
          <Text style={styles.googleText}>Sign in with Google</Text>
        </Button>

        <Text style={styles.privacyNote}>
          By logging in you agree to our Privacy Policy
        </Text>
        <Pressable>
          <Text style={styles.privacyLink}>Privacy Policy</Text>
        </Pressable>

        <Loader visible={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  containerButton: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    backgroundColor: colors.secondary,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textDark,
    marginBottom: 22,
    fontWeight: "500",
  },
  googleIcon: {
    width: 42,
    height: 42,
  },
  googleButton: {
    width: "100%",
    height: 52,
    gap: 10,
    marginBottom: 24,
  },
  googleText: {
    right: 12,
    color: "#3c3c3c",
    fontSize: 15,
    fontWeight: "600",
  },
  privacyNote: {
    color: colors.textDark,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  privacyLink: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "600",
  },
});
