import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, TextInput, StyleSheet, ToastAndroid } from "react-native";

import colors from "@/constants/colors";
import Button from "@/components/Button";

export default function SearchInput() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    if (keyword === "") {
      ToastAndroid.show("Anime apa yang ingin kamu cari?...", ToastAndroid.SHORT);
    } else if (keyword.trim() === "") {
      ToastAndroid.show("Anime apa yang ingin kamu cari?...", ToastAndroid.SHORT);
    } else {
      router.push(`search/${keyword.trim()}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Cari anime..."
          placeholderTextColor={colors.textDark}
          value={keyword}
          onChangeText={(text) => setKeyword(text)}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />

        <Button
          onPress={handleSearch}
          button={styles.button}
        >
          <Ionicons name="search" size={25} color="white" />
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 10
  },
  inputWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center"
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: colors.background,
    color: "white",
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 50,
    paddingVertical: 10,
    paddingLeft: 20,
    paddingRight: 55,
    fontSize: 14
  },
  button: {
    right: 46,
    backgroundColor: colors.accentDark,
    paddingHorizontal: 1,
    paddingVertical: 1,
    width: 40,
    height: 40,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "rgba(96,165,250,0.5)",
    borderWidth: 0.8
  }
});