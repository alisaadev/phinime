import { TextInput as RNTextInput, TextInputProps, StyleSheet } from "react-native";

import fontMap from "@/constants/fonts";

export default function TextInput({ style, ...props }: TextInputProps) {
  const flat = StyleSheet.flatten(style);
  const weight = String(flat?.fontWeight ?? "400");
  const fontFamily = fontMap[weight] ?? "Montserrat-Regular";
  const { fontWeight, ...restStyle } = flat ?? {};

  return (
    <RNTextInput
      style={[restStyle, { fontFamily }]}
      {...props}
    />
  );
}