import { useRouter } from "expo-router";
import { useEffect, useState, memo, useCallback } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";

import Text from "@/components/Text";
import colors from "@/constants/colors";
import { getGenres, Genre } from "@/services/otakudesu";

interface GenreChipProps {
  item: Genre;
  onPress: () => void;
}

function SkeletonChip() {
  return <View style={styles.skeletonChip} />;
}

const GenreChip = memo(({ item, onPress }: GenreChipProps) => (
  <TouchableOpacity style={styles.chip} activeOpacity={0.8} onPress={onPress}>
    <Text style={styles.chipText}>{item.title}</Text>
  </TouchableOpacity>
));

export default function GenreList() {
  const router = useRouter();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { genreList } = await getGenres();
      setGenres(genreList);
    } catch (err) {
      console.error("[GenreList] Gagal fetch:", err);
    } finally {
      setLoading(false);
    }
  }

  const handlePress = useCallback(
    (genreId: string) => () => router.push(`/genre/${genreId}`),
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: Genre }) => (
      <GenreChip item={item} onPress={handlePress(item.genreId)} />
    ),
    [handlePress],
  );

  const keyExtractor = useCallback((item: Genre) => item.genreId, []);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Genre</Text>
      </View>

      {loading ? (
        <View style={styles.skeletonRow}>
          {[...Array(5)].map((_, i) => (
            <SkeletonChip key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={genres}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          removeClippedSubviews
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  chipText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "600",
  },
  skeletonRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  skeletonChip: {
    width: 90,
    height: 38,
    borderRadius: 20,
    backgroundColor: colors.secondary,
  },
});
