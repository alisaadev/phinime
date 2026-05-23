import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  ActivityIndicator,
} from "react-native";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import Loader from "@/components/Loader";
import { getSchedule } from "@/services/otakudesu";
import BackButton from "@/components/BackButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DAY_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const JS_DAY_TO_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const DAY_SHORT: Record<string, string> = {
  Senin:   "Senin",
  Selasa:  "Selasa",
  Rabu:    "Rabu",
  Kamis:   "Kamis",
  Jumat:   "Jum'at",
  Sabtu:   "Sabtu",
  Minggu:  "Minggu",
};

interface AnimeItem {
  title: string;
  slug: string;
  url: string;
  poster: string;
}

interface ScheduleDay {
  day: string;
  anime_list: AnimeItem[];
}

interface DayPickerProps {
  days: string[];
  selected: string;
  onSelect: (day: string) => void;
}

interface AnimeCardProps {
  item: AnimeItem;
  onPress: (slug: string) => void;
  isLast: boolean;
}

function DayPicker({ days, selected, onSelect }: DayPickerProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const idx = days.indexOf(selected);
    if (idx >= 0 && scrollRef.current) {
      scrollRef.current.scrollTo({ x: idx * 72 - SCREEN_WIDTH / 2 + 36, animated: true });
    }
  }, [selected, days]);

  return (
    <View style={styles.dayPicker}>
      {days.map((day) => {
        const isActive = day === selected;
        return (
          <TouchableOpacity
            key={day}
            onPress={() => onSelect(day)}
            activeOpacity={0.8}
            style={[styles.dayItem, isActive && styles.dayItemActive]}
          >
            <Text style={[styles.dayNumber, isActive && styles.dayNumberActive]}>
              {DAY_SHORT[day] ?? day}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AnimeCard({ item, onPress, isLast }: AnimeCardProps) {
  return (
    <TouchableOpacity
      style={[styles.animeCard, isLast && { marginBottom: 0 }]}
      activeOpacity={0.75}
      onPress={() => onPress(item.slug)}
    >
      <View style={styles.timelineLine} />

      <Image
        source={{ uri: item.poster }}
        style={styles.poster}
        contentFit="cover"
      />

      <View style={styles.cardContent}>
        <Text style={styles.animeTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ day }: { day: string }) {
  return (
    <View style={styles.emptyWrapper}>
      <Icon name="CalendarX2" size={64} color={colors.accent} />
      <Text style={styles.emptyTitle}>Tidak ada jadwal</Text>
      <Text style={styles.emptySubtitle}>
        Tak ada kisah yang menampakkan wujudnya di hari {day}. Namun jangan risau, esok ia akan kembali menyapamu.
      </Text>
    </View>
  );
}

export default function ScheduleScreen() {
  const router = useRouter();
  const [schedule, setSchedule]     = useState<ScheduleDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [loading, setLoading]       = useState(true);
  const todayId = JS_DAY_TO_ID[new Date().getDay()];

  useEffect(() => {
    load();
  }, []);
  
  async function load() {
      try {
        const res = await getSchedule();
        const sorted = [...res.data].sort(
          (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
        );

        setSchedule(sorted);

        const todayData = sorted.find((s) => s.day === todayId);
        setSelectedDay(todayData ? todayId : sorted[0]?.day ?? "");
      } catch (e) {
        console.log("[Schedule] Gagal fetch", e)
      } finally {
        setLoading(false);
      }
    }

  const handlePress = useCallback(
    (slug: string) => {
      router.push(`/detail/${slug}`);
    },
    [router],
  );

  const days = schedule.map((s) => s.day);
  const activeList = schedule.find((s) => s.day === selectedDay)?.anime_list ?? [];
  const keyExtractor = useCallback((item: AnimeItem) => item.slug, []);

  const renderItem = useCallback(
    ({ item, index }: { item: AnimeItem; index: number }) => (
      <AnimeCard
        item={item}
        onPress={handlePress}
        isLast={index === activeList.length - 1}
      />
    ),
    [handlePress, activeList.length],
  );

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton title="Jadwal Tayang" />
      </View>

      {loading ? (
        <View style={styles.dayPicker}>
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={i} style={[styles.dayItem, { height: 34.2 }]} />
          ))}
        </View>
      ) : (
        <DayPicker
          days={days}
          selected={selectedDay}
          onSelect={setSelectedDay}
        />
      )}

      <View style={styles.divider} />
      {loading ? (
        <View style={styles.loadingWrapper}>
          <Loader visible={loading} />
        </View>
      ) : (
        <FlatList
          data={activeList}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState day={selectedDay} />}
          ListFooterComponent={<View style={{ marginBottom: "24%" }} />}
        />
      )}
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  dayPicker: {
    flexWrap: "wrap",
    flexDirection: "row",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  dayItem: {
    width: 86,
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 6,
    backgroundColor: colors.secondary,
    alignItems: "center",
  },
  dayItemActive: {
    backgroundColor: colors.accentDark,
  },
  dayNumber: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dayNumberActive: {
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.accent,
    marginHorizontal: 24,
    marginBottom: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  animeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 90,
  },
  timelineLine: {
    width: 3,
    alignSelf: "stretch",
    backgroundColor: colors.accent,
    borderRadius: 99,
    marginRight: 0,
  },
  poster: {
    width: 80,
    height: 90,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  animeTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 20,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textDark,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
