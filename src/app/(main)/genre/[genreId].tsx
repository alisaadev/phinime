import { useEffect, useState, useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";

import Text from "@/components/Text";
import colors from "@/constants/colors";
import AnimeCard from "@/components/AnimeCard";
import BackButton from "@/components/BackButton";

import {
  getAnimeByGenre,
  getGenres,
  type CompletedAnime,
  type Genre,
} from "@/services/otakudesu";
import Loader from "@/components/Loader";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const GAP = 8;
const CARD_WIDTH =
  (SCREEN_WIDTH - (32 + (COLUMN_COUNT - 1) * GAP)) / COLUMN_COUNT;

export default function GenreDetailScreen() {
  const router = useRouter();
  const { genreId } = useLocalSearchParams<{ genreId: string }>();

  const [animeList, setAnimeList] = useState<CompletedAnime[]>([]);
  const [genreTitle, setGenreTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [genreId]);

  const fetchInitialData = async () => {
    if (!genreId) return;

    try {
      setLoading(true);

      const genresResponse = await getGenres();
      const currentGenre = genresResponse.genreList.find(
        (g) => g.genreId === genreId,
      );
      if (currentGenre) {
        setGenreTitle(currentGenre.title);
      }

      const animeResponse = await getAnimeByGenre(genreId, 1);
      setAnimeList(animeResponse.animeList);
      setPage(1);
      setHasMore(
        animeResponse.animeList.length > 0 &&
          animeResponse.pagination?.hasNextPage !== false,
      );
    } catch (error) {
      console.error("[GenreDetailScreen] Gagal fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreData = async () => {
    if (isLoadingMore || !hasMore || !genreId) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const animeResponse = await getAnimeByGenre(genreId, nextPage);

      if (animeResponse.animeList.length > 0) {
        setAnimeList((prev) => [...prev, ...animeResponse.animeList]);
        setPage(nextPage);
        setHasMore(animeResponse.pagination?.hasNextPage !== false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("[GenreDetailScreen] Gagal fetch lebih banyak:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderAnimeCard = useCallback(
    ({ item }: { item: CompletedAnime }) => (
      <AnimeCard
        title={item.title}
        poster={item.poster}
        eps={item.episodes ? `${item.episodes} Eps` : undefined}
        score={item.score ? `⭐ ${item.score}` : undefined}
        subTitle={item.season}
        onPress={() => router.push(`/detail/${item.animeId}`)}
      />
    ),
    [router],
  );

  const keyExtractor = useCallback((item: CompletedAnime) => item.animeId, []);

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <Loader visible={isLoadingMore} />
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <BackButton title={genreTitle} />
          </View>

          {loading ? (
            <View style={styles.loaderContainer}>
              <Loader visible={loading} />
            </View>
          ) : (
            <FlatList
              data={animeList}
              renderItem={renderAnimeCard}
              keyExtractor={keyExtractor}
              numColumns={COLUMN_COUNT}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.listContent}
              scrollIndicatorInsets={{ right: 1 }}
              showsVerticalScrollIndicator={false}
              onEndReached={fetchMoreData}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={5}
            />
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
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footerLoader: {
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
