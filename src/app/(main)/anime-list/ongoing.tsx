import { useCallback, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

import AnimeCard from "@/components/AnimeCard";
import Loader from "@/components/Loader";
import { getOngoingAnime } from "@/services/otakudesu";
import type { OngoingAnime } from "@/services/otakudesu";

interface OngoingListProps {
  initialList: OngoingAnime[];
}

export default function OngoingList({ initialList }: OngoingListProps) {
  const router = useRouter();
  const [list, setList] = useState<OngoingAnime[]>(initialList);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOngoing = async (pageNum: number, isRefresh = false) => {
    try {
      setLoading(true);
      const response = await getOngoingAnime(pageNum);
      const newList = response.animeList;
      if (isRefresh) setList(newList);
      else setList((prev) => [...prev, ...newList]);
      if (newList.length < 10) setHasMore(false);
    } catch (error) {
      console.error("[OngoingList] Gagal fetch:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: OngoingAnime }) => (
      <AnimeCard
        title={item.title}
        poster={item.poster}
        eps={`${item.episodes} Eps`}
        score={item.releaseDay}
        subTitle={`Terakhir rilis ${item.latestReleaseDate}`}
        onPress={() => router.push(`/detail/${item.animeId}`)}
      />
    ),
    [router],
  );

  return (
    <FlatList
      data={list}
      renderItem={renderItem}
      keyExtractor={(item, index) => `ongoing-${item.animeId}-${index}`}
      numColumns={3}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.listContent}
      onRefresh={() => {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
        fetchOngoing(1, true);
      }}
      refreshing={refreshing}
      onEndReached={() => {
        if (!loading && hasMore) {
          const next = page + 1;
          setPage(next);
          fetchOngoing(next);
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
