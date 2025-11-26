import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import XLSX from "xlsx";

import { fetchUserAccessList } from "../services/api";

export default function UsersScreen({ navigation }) {
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =====================================================
        LOAD USERS LIST
  ====================================================== */
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      if (!token || !userId) {
        Alert.alert("Error", "Missing login session.");
        return;
      }

      const result = await fetchUserAccessList(userId, token);

      const mapped = result.map((item) => ({
        participantNumber: item["Participant Number"] ?? "",
        participantName: item["Participant Name"] ?? "",
        firstName: item["Firstname"] ?? "",
        lastName: item["Lastname"] ?? "",
        email: item["EmailAddress"] ?? "",
        role: item["Role Type"] ?? "",
        city: item["City"] ?? "",
        state: item["State"] ?? "",
        company: item["Company"] ?? "",
        address1: item["Address1"] ?? "",
        address2: item["Address2"] ?? "",
        cellPhone: item["Cell Phone"] ?? "",
        workPhone: item["Work Phone"] ?? "",
      }));

      setUsers(mapped);
    } catch (e) {
      console.log("User list load error:", e);
      Alert.alert("Error", "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
        SEARCH FILTER
  ====================================================== */
  const filteredData = useMemo(() => {
    if (!searchText.trim()) return users;

    return users.filter((u) =>
      Object.values(u)
        .join(" ")
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [searchText, users]);

  /* =====================================================
        EXPORT EXCEL
  ====================================================== */
  const exportToExcel = async () => {
    try {
      const ws = XLSX.utils.json_to_sheet(filteredData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");

      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
      const filePath = `${RNFS.DownloadDirectoryPath}/UsersList.xlsx`;

      await RNFS.writeFile(filePath, wbout, "base64");

      await Share.open({
        title: "Export Users",
        url: `file://${filePath}`,
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      Alert.alert("Success", "Excel exported successfully!");
    } catch (error) {
      Alert.alert("Error", "Export failed.");
    }
  };

  /* =====================================================
        LOADING VIEW
  ====================================================== */
  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#7A1E1E" />
        <Text style={{ marginTop: 10 }}>Loading Users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Title + Export */}
      <View style={styles.topRow}>
        <Text style={styles.title}>Users ({filteredData.length})</Text>

        <TouchableOpacity style={styles.exportBtn} onPress={exportToExcel}>
          <Icon name="download-outline" size={18} color="#FFF" />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Icon name="search" size={18} color="#666" style={{ marginRight: 6 }} />
        <TextInput
          placeholder="Search name or email..."
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Table Header */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.headerCell, { flex: 1.7 }]}>Participant#</Text>
        <Text style={[styles.headerCell, { flex: 3 }]}>ParticipantName</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Firstname</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Lastname</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Details</Text>
      </View>

      {/* Table Rows */}
      <ScrollView>
        {filteredData.map((u, idx) => (
          <View key={idx} style={[styles.row, styles.dataRow]}>
            <Text style={[styles.cell, { flex: 1.7 }]}>{u.participantNumber}</Text>

            <Text style={[styles.cell, { flex: 3, color: "#0B2E4F" }]}>
              {u.participantName}
            </Text>

            <Text style={[styles.cell, { flex: 2 }]}>{u.firstName}</Text>
            <Text style={[styles.cell, { flex: 2 }]}>{u.lastName}</Text>

            {/* Navigate to Details Screen */}
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => navigation.navigate("UserDetails", { userData: u })}
            >
              <Icon
                name="eye-outline"
                size={20}
                color="#0B2E4F"
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* =====================================================
        STYLES
===================================================== */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#FFFFFF" },

  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: { fontSize: 20, fontWeight: "700", color: "#0B2E4F" },

  exportBtn: {
    flexDirection: "row",
    backgroundColor: "#0B2E4F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
  },

  exportText: { color: "#FFF", marginLeft: 6, fontSize: 13 },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D3D7DF",
    backgroundColor: "#F3F6FA",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 10,
  },

  searchInput: { flex: 1, fontSize: 13 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
  },

  headerRow: { backgroundColor: "#F3F6FA" },

  headerCell: { fontSize: 12, fontWeight: "700", color: "#333" },

  dataRow: { backgroundColor: "#FFF" },

  cell: { fontSize: 12, color: "#000" },
});

