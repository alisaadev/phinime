import { useRouter } from "expo-router";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import Icon from "./Icon";
import Text from "./Text";
import colors from "@/constants/colors";

interface AnimeBatchProps {
  batchId: string;
}

export default function AnimeBatch({ batchId }: AnimeBatchProps) {
  const router = useRouter();

  if (!batchId) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Batch</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Full Pack</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push(`/batch/${batchId}` as any)}
      >
        <View style={styles.iconContainer}>
          <Icon name="Archive" size={20} color={colors.accent} />
        </View>
        <View style={styles.info}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            Download Batch (Full Episode)
          </Text>
          <Text style={styles.cardSubtitle}>
            Tersedia dalam berbagai kualitas
          </Text>
        </View>
        <View style={styles.arrow}>
          <Icon name="ChevronRight" size={18} color={colors.textSecondary} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    borderWidth: 0.8,
    borderColor: "rgba(74, 222, 128, 0.4)",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4ADE80",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.8,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.accent + "18",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: colors.accent + "44",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  arrow: {
    paddingLeft: 4,
  },
});
