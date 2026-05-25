import { useCallback, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import AnimeCard from "@/components/AnimeCard";
import Loader from "@/components/Loader";
import { getCompleteAnime } from "@/services/otakudesu";
import type { CompletedAnime } from "@/services/otakudesu";

interface CompletedListProps {
  initialList: CompletedAnime[];
}

export default function CompletedList({ initialList }: CompletedListProps) {
  const router = useRouter();
  const [list, setList] = useState<CompletedAnime[]>(initialList);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCompleted = async (pageNum: number, isRefresh = false) => {
    try {
      setLoading(true);
      const response = await getCompleteAnime(pageNum);
      const newList = response.animeList;
      if (isRefresh) setList(newList);
      else setList((prev) => [...prev, ...newList]);
      if (newList.length < 10) setHasMore(false);
    } catch (error) {
      console.error("[CompletedList] Gagal fetch:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: CompletedAnime }) => (
      <AnimeCard
        title={item.title}
        poster={item.poster}
        eps={`${item.episodes} Eps`}
        score={`⭐ ${item.score}`}
        subTitle={`Terakhir rilis ${item.lastReleaseDate}`}
        onPress={() => router.push(`/detail/${item.animeId}`)}
      />
    ),
    [router],
  );

  return (
    <FlatList
      data={list}
      renderItem={renderItem}
      keyExtractor={(item, index) => `completed-${item.animeId}-${index}`}
      numColumns={3}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.listContent}
      onRefresh={() => {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
        fetchCompleted(1, true);
      }}
      refreshing={refreshing}
      onEndReached={() => {
        if (!loading && hasMore) {
          const next = page + 1;
          setPage(next);
          fetchCompleted(next);
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={() =>
        hasMore ? (
          <Loader visible={loading} />
        ) : (
          <View style={{ marginBottom: "24%" }} />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
});
