import { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Icon from "@/components/Icon";
import Text from "@/components/Text";
import colors from "@/constants/colors";
import Loader from "@/components/Loader";
import { getCurrentUser } from "@/services/auth";
import AnimeCard from "@/components/AnimeCard";
import BackButton from "@/components/BackButton";
import { searchAnime, SearchAnime } from "@/services/otakudesu";

export default function SearchScreen() {
  const router = useRouter();
  const { query } = useLocalSearchParams<{ query: string }>();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<SearchAnime[]>([]);

  const fetchResults = useCallback(async () => {
    if (!query) return;

    try {
      setLoading(true);

      const user = await getCurrentUser();
      const response = await searchAnime(query, user?.id);

      setResults(response.animeList);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const renderItem = ({ item }: { item: SearchAnime }) => (
    <AnimeCard
      title={item.title}
      poster={item.poster}
      score={item.score}
      eps={item.status}
      onPress={() => {
        router.push(`/detail/${item.animeId}` as any);
      }}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton title={`Hasil: ${query}`} />
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <Loader visible={loading} />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Icon name="SearchX" size={64} color={colors.accent} />
          <Text style={styles.emptyTitle}>Tidak ditemukan</Text>
          <Text style={styles.emptySubtitle}>
            Kisah "{query}" tampaknya masih bersembunyi dari pandangan kita.
            Maukah kamu mencarinya kembali dengan nama yang berbeda?
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.animeId}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
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
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  columnWrapper: {
    justifyContent: "flex-start",
    gap: 8,
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
});
