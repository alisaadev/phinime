import LottieView from "lottie-react-native";
import { View, StyleSheet } from "react-native";

type LoaderProps = {
  visible: boolean;
};

export default function Loader({ visible }: LoaderProps) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.glassContainer}>
        <LottieView
          autoPlay
          style={{ width: 110, height: 110 }}
          source={require("@/animations/loading.json")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99
  },
  glassContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.2)"
  }
});