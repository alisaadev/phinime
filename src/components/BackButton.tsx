import { useRouter } from "expo-router";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";

import Icon from "./Icon";
import Text from "./Text";
import Button from "./Button";
import colors from "@/constants/colors";

interface BackButtonProps {
  title?: string;
  textStyle?: StyleProp<TextStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  iconColor?: string;
  iconSize?: number;
  onPress?: () => void;
}

export default function BackButton({
  title,
  textStyle,
  buttonStyle,
  containerStyle,
  iconColor = colors.text,
  iconSize = 24,
  onPress,
}: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Button
        onPress={handlePress}
        button={[styles.button, buttonStyle]}
        wrapper={containerStyle}
      >
        <Icon name="ChevronLeft" size={iconSize} color={iconColor} />
      </Button>
      {title && (
        <Text style={[styles.text, textStyle]} numberOfLines={1}>
          {title}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 0.8,
    borderColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondary,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
});
