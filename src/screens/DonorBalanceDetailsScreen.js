import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { fetchDonorBalanceDetails } from "../services/api";

export default function DonorBalanceDetailsScreen({ route, navigation }) {
  const { participantNumber } = route.params;

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===========================================================
      LOAD DETAILS ON SCREEN OPEN
  ============================================================ */
  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      const data = await fetchDonorBalanceDetails(
        participantNumber,
        userId,
        token
      );

      if (data.length > 0) {
        setDetails(data[0]);
      }
    } catch (err) {
      console.log("Error loading details:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===========================================================
      LOADING UI
  ============================================================ */
  if (loading || !details) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#7A1E1E" />
        <Text style={{ marginTop: 12 }}>Loading details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Donor Balances Details</Text>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close-circle-outline" size={32} color="#7A1E1E" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subHeader}>
        View detailed information for participant number: {participantNumber}
      </Text>

      {/* ============================
          PARTICIPANT INFORMATION CARD
          ============================ */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Participant Information</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Participant Number</Text>
            <Text style={styles.value}>{details.ParticipantNumber}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Participant Name</Text>
            <Text style={styles.value}>{details.ParticipantName}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Participant Balance</Text>
            <Text style={styles.value}>{details.ParticipantBalance}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>End Date</Text>
            <Text style={styles.value}>{details.EndDate}</Text>
          </View>
        </View>
      </View>

      {/* ============================
          FUND DETAILS CARD
          ============================ */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fund Details</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 3 }]}>Fund Name</Text>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Balance</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={[styles.tableValue, { flex: 3 }]}>
            {details.FundName}
          </Text>
          <Text style={[styles.tableValue, { flex: 2 }]}>
            {details.Balance}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

/* ===========================================================
      STYLES
=========================================================== */
const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#fff",
  },

  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0B2E4F",
  },

  subHeader: {
    fontSize: 14,
    color: "#7A8CA5",
    marginBottom: 18,
  },

  card: {
    backgroundColor: "#F8F9FC",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 18,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#0B2E4F",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  col: {
    flex: 1,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7A8CA5",
    marginBottom: 2,
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    padding: 10,
    borderRadius: 5,
  },

  tableHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0B2E4F",
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
  },

  tableValue: {
    fontSize: 15,
    color: "#333",
  },
});
