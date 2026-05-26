import React, { forwardRef } from "react";

import {
  TextInput as RNTextInput,
  TextInputProps,
  StyleSheet,
} from "react-native";

import fontMap from "@/constants/fonts";

const TextInput = forwardRef<RNTextInput, TextInputProps>(
  ({ style, ...props }, ref) => {
    const flat = StyleSheet.flatten(style);
    const weight = String(flat?.fontWeight ?? "400");
    const fontFamily = fontMap[weight] ?? "Circular-Regular";
    const { fontWeight, ...restStyle } = flat ?? {};

    return (
      <RNTextInput ref={ref} style={[restStyle, { fontFamily }]} {...props} />
    );
  },
);

export default TextInput;
