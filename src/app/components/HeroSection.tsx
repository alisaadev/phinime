import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { View, Text, StyleSheet, Dimensions } from "react-native";

import colors from "@/constants/colors";
import Button from "@/components/Button";
import SearchInput from "@/components/SearchInput";

const { width } = Dimensions.get("window");

const HeroSection = () => {
  const router = useRouter();

  return (
    <View style={styles.screenWrapper}>
      <View style={styles.cardContainer}>
        <View style={styles.imageWrapper}>
          <Image
            source={ require("@/images/rem.gif") }
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "#2E2F40"]}
            style={styles.imageOverlay}
          />
        </View>

        <LinearGradient
          colors={["#2E2F40", colors.primary]}
          style={styles.contentWrapper}
        >
          <Image
            source={ require("@/images/phinime.png") }
            style={styles.titleImage}
            contentFit="cover"
          />
          <Text style={styles.description}>
            PhiNime adalah aplikasi streaming anime gratis tanpa iklan, dengan akses mudah untuk menonton dan download anime favorit kapan saja dengan nyaman.
          </Text>

          <View style={styles.searchBox}>
            <SearchInput />
          </View>

          <Text style={styles.topSearch} numberOfLines={3}>
            Pencarian teratas:{"\n"}I Made Friends, One Piece, Witch Hat Atelier, Wistoria Wand And, Marriagetoxin
          </Text>

          <View style={styles.buttonGroup}>
            <Button 
              title="Nonton Anime"
              onPress={() => router.replace("screens/page")}
              button={styles.btnOne}
              text={styles.btnText}
            />
            <Button
              title="Baca Komik"
              onPress={() => router.replace("screens/page")}
              button={styles.btnTwo}
              text={styles.btnText}
            />
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    alignItems: "center",
    padding: 5
  },
  cardContainer: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)"
  },
  imageWrapper: {
    height: 250,
    position: "relative"
  },
  heroImage: {
    width: "100%",
    height: "100%"
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100
  },
  contentWrapper: {
    paddingBottom: 24,
    paddingHorizontal: 24
  },
  titleImage: {
    width: "100%",
    height: 70
  },
  description: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 14,
    lineHeight: 20,
    textAlign: "center"
  },
  searchBox: {
    marginBottom: 4
  },
  topSearch: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 24,
    textAlign: "center"
  },
  buttonGroup: {
    gap: 12
  },
  btnOne: {
    backgroundColor: "#7661cc",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center"
  },
  btnTwo: {
    backgroundColor: colors.accent,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center"
  },
  btnText: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 16
  }
});

export default HeroSection;