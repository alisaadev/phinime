import { useRef, useState } from "react";
import { BlurTargetView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import Text from "@/components/Text";
import colors from "@/constants/colors";
import Navbar from "@/components/Navbar";
import Home from "@/onboarded/(tabs)/home";

export default function index() {
  const [activeTab, setActiveTab] = useState(0);
  const blurTargetRef = useRef<View | null>(null);

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        <BlurTargetView ref={blurTargetRef} style={styles.blurTarget}>
          <View style={[styles.contentArea, activeTab !== 0 && styles.hidden]}>
            <Home />
          </View>
          <View style={[styles.contentArea, activeTab !== 1 && styles.hidden]}>
            <Text style={styles.contentText}>Halaman Superuser</Text>
          </View>
          <View style={[styles.contentArea, activeTab !== 2 && styles.hidden]}>
            <Text style={styles.contentText}>Halaman Modul</Text>
          </View>
          <View style={[styles.contentArea, activeTab !== 3 && styles.hidden]}>
            <Text style={styles.contentText}>Halaman Setelan</Text>
          </View>
        </BlurTargetView>

        <Navbar
          selectedIndex={activeTab}
          onSelect={(index: number) => setActiveTab(index)}
          blurTargetRef={blurTargetRef}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  blurTarget: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  hidden: {
    display: "none",
  },
  contentText: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
  },
});
