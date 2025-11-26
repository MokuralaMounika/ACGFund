import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DashboardScreen({ route, navigation }) {
  const [userName, setUserName] = useState("");

  /* -------------------------------------------
      Load User Name for Welcome Text
  --------------------------------------------*/
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const first = await AsyncStorage.getItem("firstName");
    const last = await AsyncStorage.getItem("lastName");
    setUserName(first && last ? `${first} ${last}` : "");
  };

  /* -------------------------------------------
      Header Person Icon + Title
  --------------------------------------------*/
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={{ marginRight: 12 }}
        >
          <Icon name="person-circle-outline" size={30} color="#fff" />
        </TouchableOpacity>
      ),
      headerTitle: () => (
        <View>
          <Text style={{ color: "#fff", fontSize: 18, fontFamily: "Geist" }}>
            Dashboard
          </Text>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Welcome Text */}
      <Text style={styles.welcomeText}>
        Welcome back, ACG{userName}!
      </Text>

      {/* FEATURE BOXES GRID */}
      <View style={styles.gridRow}>
        {/* Box 1 */}
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate("CustomReports")}
        >
          <Icon name="document-text-outline" size={30} color="#7A1E1E" />
          <Text style={styles.boxText}>Custom Reports</Text>
        </TouchableOpacity>

        {/* Box 2 */}
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate("ProcessData")}
        >
          <Icon name="sync-outline" size={30} color="#7A1E1E" />
          <Text style={styles.boxText}>Process Data</Text>
        </TouchableOpacity>
      </View>

      {/* Second Row */}
      <View style={styles.gridRow}>
        {/* Box 3 */}
        <TouchableOpacity
          style={styles.box}
          onPress={() => navigation.navigate("FundPrice")}
        >
          <Icon name="trending-up-outline" size={30} color="#7A1E1E" />
          <Text style={styles.boxText}>Fund Price</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* -------------------------
      STYLES
--------------------------*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#FFFFFF",
  },

  welcomeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0B2E4F",
    fontFamily: "Geist",
    marginBottom: 18,
  },

  /* Two boxes per row */
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  box: {
    width: "48%", // two boxes in one row
    backgroundColor: "#F3F6FA",
    borderWidth: 1,
    borderColor: "#D3D7DF",
    borderRadius: 12,
    paddingVertical: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  boxText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#0B2E4F",
    fontFamily: "Geist",
  },
});
