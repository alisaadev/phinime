import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";

import Loader from "@/components/Loader";
import AnimeCard from "@/components/AnimeCard";
import { getOngoingAnime, type OngoingAnime } from "@/services/otakudesu";

interface OngoingListProps {
  initialList: OngoingAnime[];
}

export default function OngoingList({ initialList }: OngoingListProps) {
  const router = useRouter();
  const [list, setList] = useState<OngoingAnime[]>(initialList);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchOngoing = async (pageNum: number, isRefresh = false) => {
    try {
      if (pageNum > 1) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await getOngoingAnime(pageNum);
      const newList = response.animeList;
      if (isRefresh) setList(newList);
      else setList((prev) => [...prev, ...newList]);
      if (newList.length < 10) setHasMore(false);
    } catch (error) {
      console.error("[OngoingList] Gagal fetch:", error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
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
        onPress={() => router.push(`/detail/${item.animeId}` as any)}
      />
    ),
    [router],
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <Loader visible={true} />
      </View>
    );
  };

  return (
    <FlatList
      data={list}
      renderItem={renderItem}
      keyExtractor={(item, index) => `ongoing-${item.animeId}-${index}`}
      numColumns={3}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.listContent}
      scrollIndicatorInsets={{ right: 1 }}
      showsVerticalScrollIndicator={false}
      onEndReached={() => {
        if (!loading && !isLoadingMore && hasMore) {
          const next = page + 1;
          setPage(next);
          fetchOngoing(next);
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      initialNumToRender={4}
      maxToRenderPerBatch={4}
      windowSize={5}
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
  footerLoader: {
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
