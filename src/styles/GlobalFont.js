import React from "react";
import { Text, TextInput } from "react-native";

// Geist Sans (Default)
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
Text.defaultProps.style = [{ fontFamily: "Geist-Regular" }, Text.defaultProps.style];

// Geist Sans for TextInput
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;
TextInput.defaultProps.style = [{ fontFamily: "Geist-Regular" }, TextInput.defaultProps.style];

export default function GlobalFont({ children }) {
  return <>{children}</>;
}
