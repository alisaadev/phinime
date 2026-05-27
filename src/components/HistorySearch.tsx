import { useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import Icon from "./Icon";
import Text from "./Text";
import colors from "@/constants/colors";

import {
  getSearchHistory,
  clearSearchHistory,
  deleteSearchHistoryItem,
} from "@/services/cache";
import { getCurrentUser } from "@/services/auth";

export default function SearchIndex() {
  const router = useRouter();
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    loadHistory();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const loadHistory = async () => {
    const user = await getCurrentUser();
    if (user) {
      const data = await getSearchHistory(user.id);
      setHistory(data);
    }
  };

  const handleSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    router.push(`/search/${trimmed}`);
  };

  const handleDeleteHistory = async (item: string) => {
    const user = await getCurrentUser();
    if (user) {
      await deleteSearchHistoryItem(user.id, item);
      loadHistory();
    }
  };

  const handleClearHistory = async () => {
    const user = await getCurrentUser();
    if (user) {
      await clearSearchHistory(user.id);
      setHistory([]);
    }
  };

  return (
    <View style={history.length > 0 ? styles.container : undefined}>
      {history.length > 0 && (
        <View style={styles.header}>
          <Text style={styles.sectionTitle}>Riwayat pencarian</Text>
          <TouchableOpacity
            style={styles.scheduleBtn}
            onPress={handleClearHistory}
            activeOpacity={0.8}
          >
            <Text style={styles.scheduleBtnText}>Hapus semua</Text>
          </TouchableOpacity>
        </View>
      )}

      {history.map((item, index) => (
        <View key={index} style={styles.historyItem}>
          <TouchableOpacity
            style={styles.historyTextContainer}
            onPress={() => handleSearch(item)}
          >
            <Icon name="History" size={16} color={colors.textDark} />
            <Text style={styles.historyText}>{item}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteHistory(item)}>
            <Icon name="X" size={16} color={colors.textDark} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  scheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  scheduleBtnText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "600",
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginHorizontal: 16,
    borderBottomWidth: 0.8,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  historyTextContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyText: {
    color: colors.text,
    fontSize: 14,
  },
});
