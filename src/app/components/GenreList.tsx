import { useRouter } from "expo-router";
import { useEffect, useState, memo } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";

import Text from "@/components/Text";
import colors from "@/constants/colors";
import { getGenres, Genre } from "@/services/api";

function SkeletonChip() {
  return <View style={styles.skeletonChip} />;
}

export default function GenreList() {
  const router = useRouter();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { genreList } = await getGenres();
        setGenres(genreList);
      } catch (err) {
        console.error("[GenreList] Gagal fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderItem = memo(({ item }: { item: Genre }) => (
    <TouchableOpacity
      style={styles.chip}
      activeOpacity={0.7}
      onPress={() => router.push(`/genre/${item.genreId}`)}
    >
      <Text style={styles.chipText}>{item.title}</Text>
    </TouchableOpacity>
  ));

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
          keyExtractor={(item) => item.genreId}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  listContent: {
    paddingHorizontal: 10,
    gap: 10,
  },
  chip: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  chipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  skeletonRow: {
    flexDirection: "row",
    paddingHorizontal: 10,
    gap: 10,
  },
  skeletonChip: {
    width: 90,
    height: 38,
    borderRadius: 20,
    backgroundColor: colors.secondary,
  },
});
