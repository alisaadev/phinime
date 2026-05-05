import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import Signin from "@/signin/page";
import colors from "@/constants/colors";
import HeroSection from "@/components/HeroSection";

export default function WelcomeScreen() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeAreaView}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <StatusBar style="light" />
            <HeroSection />
            <Signin />
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center"
  }
});