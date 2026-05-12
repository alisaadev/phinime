import { Text as RNText, TextProps, StyleSheet } from "react-native";

import fontMap from "@/constants/fonts";

export default function Text({ style, ...props }: TextProps) {
  const flat = StyleSheet.flatten(style);
  const weight = String(flat?.fontWeight ?? "400");
  const fontFamily = fontMap[weight] ?? "Montserrat-Regular";
  const { fontWeight, ...restStyle } = flat ?? {};

  return <RNText style={[restStyle, { fontFamily }]} {...props} />;
}
