import { useEffect, useState, memo } from "react";
import { View, StyleSheet, Animated } from "react-native";

import Text from "./Text";
import colors from "@/constants/colors";
import { supabase } from "@/lib/supabase";
import {
  getUserExp,
  getLevelProgress,
  expRequiredForLevel,
  RANKS,
  MAX_LEVEL,
  UserExp,
} from "@/services/exp";

function ExpProgressBar({
  percent,
  color,
}: {
  percent: number;
  color: string;
}) {
  const width = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(width, {
      toValue: percent,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percent]);

  const animatedWidth = width.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.track}>
      <Animated.View
        style={[styles.fill, { width: animatedWidth, backgroundColor: color }]}
      />
    </View>
  );
}

function ExpCard({ variant = "full" }: { variant?: "compact" | "full" }) {
  const [expData, setExpData] = useState<UserExp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExp();
  }, []);

  async function fetchExp() {
    const { data: authData } = await supabase.auth.getUser();
    const uid = authData.user?.id;
    if (!uid) return;
    const data = await getUserExp(uid);
    setExpData(data);
    setLoading(false);
  }

  if (loading || !expData) {
    return (
      <View
        style={[
          styles.skeleton,
          variant === "compact" && styles.skeletonCompact,
        ]}
      />
    );
  }

  const rank = RANKS[expData.rank - 1];
  const percent = getLevelProgress(expData.level, expData.exp);
  const needed = expRequiredForLevel(expData.level);
  const isMaxLevel = expData.level >= MAX_LEVEL;

  if (variant === "compact") {
    return (
      <View style={styles.compact}>
        <View style={styles.compactTop}>
          <View style={[styles.rankDot, { backgroundColor: rank.color }]} />
          <Text style={[styles.compactRank, { color: rank.color }]}>
            {rank.name}
          </Text>
          <Text style={styles.compactLevel}>Lv. {expData.level}</Text>
        </View>

        <ExpProgressBar percent={percent} color={rank.color} />

        <Text style={styles.compactExp}>
          {isMaxLevel ? "MAX LEVEL" : `${expData.exp} / ${needed} EXP`}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.rankName, { color: rank.color }]}>
            {rank.name}
          </Text>
          <Text style={styles.rankProfileText}>{rank.profileText}</Text>
        </View>
        <View style={[styles.levelBadge, { borderColor: rank.color + "60" }]}>
          <Text style={[styles.levelNum, { color: rank.color }]}>
            {expData.level}
          </Text>
          <Text style={styles.levelLabel}>LV</Text>
        </View>
      </View>

      <View style={styles.progressWrapper}>
        <ExpProgressBar percent={percent} color={rank.color} />
        <View style={styles.expLabelRow}>
          <Text style={styles.expCurrent}>
            {isMaxLevel ? "MAX LEVEL" : `${expData.exp} EXP`}
          </Text>
          {!isMaxLevel && <Text style={styles.expNeeded}>{needed} EXP</Text>}
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: rank.color }]}>
            {expData.ep_counter}
          </Text>
          <Text style={styles.statLbl}>Episode</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: rank.color }]}>
            {Math.floor(expData.ep_counter / 2)}
          </Text>
          <Text style={styles.statLbl}>Total EXP</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statVal, { color: rank.color }]}>
            {MAX_LEVEL - expData.level}
          </Text>
          <Text style={styles.statLbl}>Level Lagi</Text>
        </View>
      </View>
    </View>
  );
}

export default memo(ExpCard);

const styles = StyleSheet.create({
  skeleton: {
    height: 120,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  skeletonCompact: {
    height: 0,
  },
  card: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  rankName: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  rankProfileText: {
    fontSize: 14,
    color: colors.textDark,
    fontStyle: "italic",
  },
  levelBadge: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 52,
  },
  levelNum: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
  },
  levelLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textDark,
    letterSpacing: 1,
  },
  progressWrapper: {
    gap: 6,
  },
  track: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 3,
  },
  expLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expCurrent: {
    fontSize: 10,
    color: colors.textDark,
    fontWeight: "600",
  },
  expNeeded: {
    fontSize: 10,
    color: colors.textDark,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  statVal: {
    fontSize: 16,
    fontWeight: "800",
  },
  statLbl: {
    fontSize: 9,
    color: colors.textDark,
    fontWeight: "500",
  },
  statDivider: {
    width: 0.5,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginVertical: 2,
  },
  compact: {
    gap: 5,
  },
  compactTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rankDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  compactRank: {
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },
  compactLevel: {
    fontSize: 11,
    color: colors.textDark,
    fontWeight: "600",
  },
  compactExp: {
    fontSize: 9,
    color: colors.textDark,
    textAlign: "right",
  },
});
