import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import Text from "@/components/Text";
import colors from "@/constants/colors";
import { signOut } from "@/services/auth";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";

type UserData = {
  name: string;
  avatar: string;
  email: string;
};

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUser({
        name: user.user_metadata?.full_name ?? "User",
        avatar: user.user_metadata?.avatar_url ?? "",
        email: user.email ?? "",
      });
    });
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/onboarded/login");
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image
          source={{ uri: user.avatar }}
          style={styles.avatar}
          contentFit="cover"
        />
        <View>
          <Text style={styles.greeting}>👋 Halo, {user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      <Button
        title="Sign Out"
        text={styles.logoutText}
        button={styles.logoutButton}
        onPress={handleSignOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    marginHorizontal: 16,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  greeting: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  email: {
    color: colors.textDark,
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderWidth: 0.8,
    borderColor: "rgba(239,68,68,0.5)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 13,
    fontWeight: "700",
  },
});
