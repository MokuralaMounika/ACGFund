import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import GlobalFont from "./src/styles/GlobalFont";

export default function App() {
  return (
    <GlobalFont>
      <AppNavigator />
    </GlobalFont>
  );
}
