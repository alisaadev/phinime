import { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
} from "react-native";

import Text from "@/components/Text";
import colors from "@/constants/colors";
import Loader from "@/components/Loader";
import BackButton from "@/components/BackButton";

import OngoingList from "./ongoing";
import CompletedList from "./completed";

import {
  getOngoingAnime,
  getCompleteAnime,
  type OngoingAnime,
  type CompletedAnime,
} from "@/services/otakudesu";

const TABS = [
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
] as const;

type TabType = "ongoing" | "completed";

export default function AnimeListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type: TabType }>();
  const initialTab: TabType =
    params.type === "completed" ? "completed" : "ongoing";

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [ongoingList, setOngoingList] = useState<OngoingAnime[]>([]);
  const [completedList, setCompletedList] = useState<CompletedAnime[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tabWidth, setTabWidth] = useState(0);

  const slide = useRef(
    new Animated.Value(initialTab === "completed" ? 1 : 0),
  ).current;

  const scales = useRef(
    TABS.map(
      (_, i) =>
        new Animated.Value(
          (initialTab === "ongoing" && i === 0) ||
            (initialTab === "completed" && i === 1)
            ? 1.1
            : 1,
        ),
    ),
  ).current;

  const itemWidth = tabWidth / TABS.length;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ongoing, completed] = await Promise.all([
          getOngoingAnime(1),
          getCompleteAnime(1),
        ]);

        setOngoingList(ongoing.animeList);
        setCompletedList(completed.animeList);
      } catch (error) {
        console.error("[AnimeListScreen] Gagal fetch:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const selectedIndex = activeTab === "ongoing" ? 0 : 1;

    Animated.spring(slide, {
      toValue: selectedIndex,
      useNativeDriver: true,
      friction: 10,
      tension: 50,
    }).start();

    TABS.forEach((_, i) => {
      Animated.spring(scales[i], {
        toValue: i === selectedIndex ? 1.1 : 1,
        useNativeDriver: true,
        friction: 6,
        tension: 50,
      }).start();
    });
  }, [activeTab]);

  const handleTabChange = (tab: TabType) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    router.setParams({ type: tab });
  };

  const onLayout = (e: LayoutChangeEvent) => {
    setTabWidth(e.nativeEvent.layout.width);
  };

  const bubbleTranslateX =
    itemWidth > 0
      ? slide.interpolate({
          inputRange: [0, 1],
          outputRange: [0, itemWidth],
          extrapolate: "clamp",
        })
      : new Animated.Value(0);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton />

            <View style={styles.switchContainer} onLayout={onLayout}>
              {tabWidth > 0 && (
                <Animated.View
                  style={[
                    styles.activeBubble,
                    {
                      width: itemWidth - 7.2,
                      transform: [{ translateX: bubbleTranslateX }],
                    },
                  ]}
                />
              )}

              {TABS.map((tab, index) => (
                <TouchableOpacity
                  key={tab.key}
                  style={styles.switchButton}
                  activeOpacity={0.8}
                  onPress={() => handleTabChange(tab.key)}
                >
                  <Animated.View
                    style={{ transform: [{ scale: scales[index] }] }}
                  >
                    <Text
                      style={[
                        styles.switchText,
                        activeTab === tab.key && styles.activeText,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {initialLoading ? (
            <View style={styles.loadingWrapper}>
              <Loader visible={true} />
            </View>
          ) : (
            <View style={styles.content}>
              <View
                style={[
                  styles.page,
                  { display: activeTab === "ongoing" ? "flex" : "none" },
                ]}
              >
                <OngoingList initialList={ongoingList} />
              </View>

              <View
                style={[
                  styles.page,
                  { display: activeTab === "completed" ? "flex" : "none" },
                ]}
              >
                <CompletedList initialList={completedList} />
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  switchContainer: {
    flex: 1,
    height: 45,
    borderRadius: 40,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary,
  },
  activeBubble: {
    position: "absolute",
    height: 39,
    left: 2.5,
    borderRadius: 36,
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  switchButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    height: "100%",
  },
  switchText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  activeText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
