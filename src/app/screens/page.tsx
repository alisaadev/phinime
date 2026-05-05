import { useState } from "react";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import Home from "@/screens/Home";
import colors from "@/constants/colors";
import Navbar from "@/components/Navbar";

export default function Page() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <Home />;
      case 1:
        return <Text style={styles.contentText}>Halaman Superuser</Text>;
      case 2:
        return <Text style={styles.contentText}>Halaman Modul</Text>;
      case 3:
        return <Text style={styles.contentText}>Halaman Setelan</Text>;
      default:
        return <Text style={styles.contentText}>Beranda</Text>;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeAreaView}>
        <StatusBar style="light" />
        <View style={styles.container}>
          <View style={styles.contentArea}>
            {renderContent()}
          </View>

          <Navbar 
            selectedIndex={activeTab} 
            onSelect={(index: number) => setActiveTab(index)} 
          />
        </View>
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
  },
  contentArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  contentText: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text
  }
});