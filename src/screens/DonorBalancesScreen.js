import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import RNFS from "react-native-fs";
import Share from "react-native-share";
import XLSX from "xlsx";

import { fetchDonorBalances } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DonorBalancesScreen({ navigation }) {
  const [selectedName, setSelectedName] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [donorData, setDonorData] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================================================
        FETCH DONOR BALANCES
  ================================================= */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      if (!token || !userId) {
        Alert.alert("Error", "Missing login information.");
        return;
      }

      const result = await fetchDonorBalances(userId, token);

      const mapped = result.map((item) => ({
        id: item["Donor #"] ?? "",
        donorName: item["Donor Name"] ?? "",
        endDate: item["EndDate"] ?? "",
        balance: item["Balance"] ?? "",
      }));

      setDonorData(mapped);
    } catch (err) {
      Alert.alert("Error", "Failed to load donor balances.");
    } finally {
      setLoading(false);
    }
  };

  /* ================================================
        SEARCH FILTER
  ================================================= */
  const filteredData = useMemo(() => {
    if (!searchText.trim()) return donorData;

    return donorData.filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [searchText, donorData]);

  /* ================================================
        EXPORT TO EXCEL
  ================================================= */
  const exportToExcel = async () => {
    try {
      const ws = XLSX.utils.json_to_sheet(filteredData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "DonorBalances");

      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      const filePath = `${RNFS.DownloadDirectoryPath}/DonorBalances.xlsx`;
      await RNFS.writeFile(filePath, wbout, "base64");

      await Share.open({
        title: "Export Donor Balances",
        url: `file://${filePath}`,
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      Alert.alert("Success", "Excel exported successfully!");
    } catch (e) {
      Alert.alert("Error", "Failed to export Excel");
    }
  };

  /* ================================================
        LOADING UI
  ================================================= */
  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#7A1E1E" />
        <Text style={{ marginTop: 10 }}>Loading Donor Balances...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Title + Export */}
      <View style={styles.topRow}>
        <Text style={styles.title}>Donor Balances ({filteredData.length})</Text>

        <TouchableOpacity style={styles.exportBtn} onPress={exportToExcel}>
          <Icon name="download-outline" size={18} color="#FFF" />
          <Text style={styles.exportText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <Icon name="search" size={18} color="#666" style={{ marginRight: 6 }} />
        <TextInput
          placeholder="Search donor, date, balance..."
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Table Header */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.headerCell, { flex: 1 }]}>Donor</Text>
        <Text style={[styles.headerCell, { flex: 3 }]}>Donor Name</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>End Date</Text>
        <Text style={[styles.headerCell, { flex: 2 }]}>Balance</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>Details</Text>
      </View>

      {/* Table Rows — NO HORIZONTAL SCROLL */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredData.map((item, index) => (
          <View key={index} style={[styles.row, styles.dataRow]}>
            <Text style={[styles.cell, { flex: 1 }]}>{item.id}</Text>

            {/* Donor name wraps into multiple lines */}
            <TouchableOpacity
              onPress={() => setSelectedName(item.donorName)}
              style={{ flex: 3 }}
            >
              <Text style={[styles.cell, styles.multiLineText]}>
                {item.donorName}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.cell, { flex: 2 }]}>{item.endDate}</Text>
            <Text style={[styles.cell, { flex: 2 }]}>{item.balance}</Text>

            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() =>
                navigation.navigate("DonorBalanceDetails", {
                  participantNumber: item.id,
                })
              }
            >
              <Icon
                name="eye-outline"
                size={20}
                color="#7A1E1E"
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Modal */}
      <Modal visible={!!selectedName} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedName(null)}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Donor Name</Text>
            <Text style={styles.modalText}>{selectedName}</Text>

            <TouchableOpacity
              onPress={() => setSelectedName(null)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

/* ================================================
        STYLES
================================================ */
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
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
  },

  headerRow: { backgroundColor: "#F3F6FA" },

  headerCell: { fontSize: 12, fontWeight: "700", color: "#333" },

  dataRow: { backgroundColor: "#FFF" },

  cell: { fontSize: 12, color: "#000" },

  /* Wrap text into multiple lines properly */
  multiLineText: {
    flexWrap: "wrap",
    width: "100%",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#FFF",
  },

  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },

  modalText: { fontSize: 15, marginBottom: 20 },

  closeBtn: {
    alignSelf: "flex-end",
    backgroundColor: "#7A1E1E",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },

  closeBtnText: { color: "#FFF", fontSize: 14 },
});
