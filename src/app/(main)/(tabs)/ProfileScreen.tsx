import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import Loader from "@/components/Loader";
import Header from "@/components/Header";
import ExpCard from "@/components/ExpCard";
import { getBookmarks } from "@/services/bookmark";
import { getWatchHistory } from "@/services/history";
import { getUserExp, UserExp } from "@/services/exp";
import { AlertDialog, Toast } from "@/components/Alert";
import { useAlertDialog, useToast } from "@/hooks/useAlert";
import RankAvatarBorder from "@/components/RankAvatarBorder";

interface ProfileData {
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface Stats {
  watched: number;
  bookmarks: number;
  completed: number;
}

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
  secret?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statNum}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({ icon, label, onPress, danger, secret }: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View
        style={[
          styles.menuIcon,
          danger && styles.menuIconDanger,
          secret && styles.menuIconSecret,
        ]}
      >
        <Icon
          name={icon as any}
          size={18}
          color={secret ? "#FFD700" : danger ? "#F87171" : colors.text}
        />
      </View>
      <Text
        style={[
          styles.menuLabel,
          danger && styles.menuLabelDanger,
          secret && styles.menuLabelSecret,
        ]}
      >
        {label}
      </Text>
      <Icon
        name="ChevronRight"
        size={14}
        color={secret ? "#FFD700" : danger ? "#F87171" : colors.textDark}
      />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const scroll = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [expData, setExpData] = useState<UserExp | null>(null);
  const [stats, setStats] = useState<Stats>({
    watched: 0,
    bookmarks: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [easterEggCount, setEasterEggCount] = useState(0);

  const {
    state: alertState,
    confirm,
    show: showDialog,
    hide: hideAlert,
  } = useAlertDialog();
  const { state: toastState, error: toastError, hide: hideToast } = useToast();

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) return;

      const uid = user.id;
      const email = user.email ?? "";
      const name = user.user_metadata?.full_name ?? email.split("@")[0];
      const avatarUrl = user.user_metadata?.avatar_url ?? null;

      setProfile({ name, email, avatarUrl });

      const [history, bookmarkList, exp] = await Promise.all([
        getWatchHistory(uid, 1000),
        getBookmarks(uid),
        getUserExp(uid),
      ]);

      const completed = history.filter(
        (h) => h.duration_ms > 0 && h.progress_ms / h.duration_ms >= 0.9,
      ).length;

      setExpData(exp);
      setStats({
        watched: history.length,
        bookmarks: bookmarkList.length,
        completed,
      });
    } catch (err) {
      console.error("[Profile] Gagal fetch:", err);
    } finally {
      setLoading(false);
    }
  }

  const handlePickAvatar = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showDialog({
        title: "Izin diperlukan",
        message: "Izinkan akses galeri untuk mengganti foto profil.",
        confirmText: "Siap",
        onConfirm: hideAlert,
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const uri = result.assets[0].uri;
    setAvatarLoading(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData.user?.id;
      if (!uid) return;

      const ext = uri.split(".").pop() ?? "jpg";
      const path = `avatars/${uid}.${ext}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(path, blob, { upsert: true, contentType: `image/${ext}` });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("profiles")
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;

      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      setProfile((prev) => (prev ? { ...prev, avatarUrl: publicUrl } : prev));
    } catch (err) {
      console.error("[Profile] Gagal upload avatar:", err);
      toastError("Gagal", "Tidak dapat mengganti foto profil. Coba lagi.");
    } finally {
      setAvatarLoading(false);
    }
  }, [showDialog, hideAlert, toastError]);

  const handleSignOut = useCallback(() => {
    confirm(
      "Sign Out",
      "Yakin ingin keluar?",
      async () => {
        await supabase.auth.signOut();
        router.replace("/(auth)/login");
      },
      { variant: "warning", confirmText: "Sign Out" },
    );
  }, [router, confirm]);

  const handleSettings = useCallback(() => {
    router.push("/search/");
  }, [router]);

  const handleEasterEgg = useCallback(() => {
    const count = easterEggCount + 1;
    setEasterEggCount(count);

    const messages = [
      { title: "⚠️ Jangan diklik!", message: "Katanya jangan diklik..." },
      { title: "😠 Serius nih!", message: "Udah dibilang jangan diklik." },
      { title: "🤨 Kamu sengaja.", message: "Ini sudah yang ke-3 kalinya." },
      {
        title: "😤 Oke fine.",
        message: "Kamu menang. Tidak ada apa-apa di sini.",
      },
      {
        title: "🎉 Selamat!",
        message: "Kamu menemukan... tombol ini lagi. Hebat sekali.",
      },
      { title: "💀", message: "..." },
    ];

    const msg = messages[Math.min(count - 1, messages.length - 1)];
    showDialog({
      title: msg.title,
      message: msg.message,
      onConfirm: hideAlert,
    });
  }, [easterEggCount, showDialog, hideAlert]);

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <Loader visible={loading} />
      </View>
    );
  }

  const initials = getInitials(profile?.name ?? "?");

  return (
    <View style={styles.container}>
      <Header title="profile" scroll={scroll} />
      <Animated.ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scroll } } }],
          { useNativeDriver: false },
        )}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={styles.profileHeader}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePickAvatar}
            disabled={avatarLoading}
            style={styles.avatarContainer}
          >
            <RankAvatarBorder
              rank={(expData?.rank as 1 | 2 | 3 | 4) ?? 1}
              avatarUrl={profile?.avatarUrl ?? null}
              initials={initials}
              size={100}
            />
            <View style={styles.avatarEditBadge}>
              {avatarLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon name="Camera" size={12} color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard value={stats.watched} label="Ditonton" />
          <View style={styles.statDivider} />
          <StatCard value={stats.bookmarks} label="Bookmark" />
          <View style={styles.statDivider} />
          <StatCard value={stats.completed} label="Selesai" />
        </View>

        <ExpCard variant="full" />
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>PENGATURAN</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="Settings"
              label="Pengaturan"
              onPress={handleSettings}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="LogOut"
              label="Sign Out"
              onPress={handleSignOut}
              danger
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>???</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="TriangleAlert"
              label="Don't click this"
              onPress={handleEasterEgg}
              secret
            />
          </View>
        </View>

        <View style={styles.padding} />
      </Animated.ScrollView>

      <AlertDialog {...alertState} onDismiss={hideAlert} />
      <Toast {...toastState} onHide={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.background,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 14,
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },
  email: {
    fontSize: 13,
    color: colors.textDark,
    marginTop: 4,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statNum: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.accent,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textDark,
    marginTop: 3,
    fontWeight: "500",
  },
  statDivider: {
    width: 0.5,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 4,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 6,
  },
  menuSectionTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textDark,
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  menuDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginHorizontal: 14,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconDanger: {
    backgroundColor: "rgba(248,113,113,0.12)",
  },
  menuIconSecret: {
    backgroundColor: "rgba(255,215,0,0.12)",
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  menuLabelDanger: {
    color: "#F87171",
  },
  menuLabelSecret: {
    color: "#FFD700",
  },
  padding: {
    marginBottom: "24%",
  },
});
