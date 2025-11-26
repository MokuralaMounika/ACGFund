import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { fetchAdvisorBalanceDetails } from "../services/api";

export default function AdvisorBalanceDetailsScreen({ route, navigation }) {
  const { agentNumber } = route.params;

  const [loading, setLoading] = useState(true);
  const [advisorInfo, setAdvisorInfo] = useState(null);
  const [donorList, setDonorList] = useState([]);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      const result = await fetchAdvisorBalanceDetails(
        agentNumber,
        userId,
        token
      );

      if (result.length > 0) {
        const first = result[0]; // contains advisor info

        setAdvisorInfo({
          advisorNo: first["Advisor#"],
          advisorName: first["Advisor"],
          endDate: first["EndDate"],
        });

        const donors = result.map((row) => ({
          donorNo: row["Donor#"],
          donorName: row["Donor Name"],
          balance: row["Balance"],
        }));

        setDonorList(donors);
      }
    } catch (e) {
      console.log("Error loading details:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#7A1E1E" />
        <Text style={{ marginTop: 10 }}>Loading Advisor Details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Top Title */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Advisor Balances Details</Text>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close-outline" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subTitle}>
        View detailed information for advisor number: {agentNumber}
      </Text>

      {/* Advisor Info Box */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Advisor Information</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Advisor #</Text>
            <Text style={styles.value}>{advisorInfo?.advisorNo}</Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.label}>Advisor Name</Text>
            <Text style={styles.value}>{advisorInfo?.advisorName}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>End Date</Text>
            <Text style={styles.value}>{advisorInfo?.endDate}</Text>
          </View>
        </View>
      </View>

      {/* Donor Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Donor Details</Text>

        {/* Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Donor #</Text>
          <Text style={[styles.tableHeaderText, { flex: 3 }]}>Donor Name</Text>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>Balance</Text>
        </View>

        {/* Rows */}
        {donorList.map((d, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.tableText, { flex: 1 }]}>{d.donorNo}</Text>
            <Text style={[styles.tableText, { flex: 3 }]}>{d.donorName}</Text>
            <Text style={[styles.tableText, { flex: 2 }]}>{d.balance}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* ================================
      Styles
================================ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#FFFFFF",
  },

  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0B2E4F",
  },

  subTitle: {
    marginTop: 5,
    marginBottom: 15,
    color: "#666",
  },

  card: {
    backgroundColor: "#F6F8FB",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
    color: "#0B2E4F",
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  infoBlock: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    color: "#555",
  },

  value: {
    fontSize: 14,
    color: "#000",
    marginTop: 3,
    fontWeight: "600",
  },

  tableHeader: {
    backgroundColor: "#E8ECF2",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
  },

  tableHeaderText: {
    fontWeight: "700",
    fontSize: 12,
  },

  tableText: {
    fontSize: 13,
    color: "#000",
  },
});
