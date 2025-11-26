import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function UserDetailsScreen({ route, navigation }) {
  const user = route.params?.userData; // MUST match navigate param

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16 }}>No user details found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>User Details</Text>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* USER INFORMATION */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>User Information</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Participant Number</Text>
            <Text style={styles.value}>{user.participantNumber}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Participant Name</Text>
            <Text style={styles.value}>{user.participantName}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Role Type</Text>
            <Text style={styles.value}>{user.role || "N/A"}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Firstname</Text>
            <Text style={styles.value}>{user.firstName}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Lastname</Text>
            <Text style={styles.value}>{user.lastName}</Text>
          </View>
        </View>
      </View>

      {/* ADDITIONAL DETAILS */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Additional Details</Text>

        {/* ROW 1 */}
        <View style={styles.row}>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Company</Text>
            <Text style={styles.detailValue}>{user.company || "N/A"}</Text>
          </View>

          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Address1</Text>
            <Text style={styles.detailValue}>{user.address1 || "N/A"}</Text>
          </View>

          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Address2</Text>
            <Text style={styles.detailValue}>{user.address2 || "N/A"}</Text>
          </View>
        </View>

        {/* ROW 2 */}
        <View style={styles.row}>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>City</Text>
            <Text style={styles.detailValue}>{user.city}</Text>
          </View>

          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>State</Text>
            <Text style={styles.detailValue}>{user.state}</Text>
          </View>

          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Email Address</Text>
            <Text style={styles.detailValue}>{user.email}</Text>
          </View>
        </View>

        {/* ROW 3 */}
        <View style={styles.row}>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Cell Phone</Text>
            <Text style={styles.detailValue}>{user.cellPhone || "N/A"}</Text>
          </View>

          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Work Phone</Text>
            <Text style={styles.detailValue}>{user.workPhone || "N/A"}</Text>
          </View>

          {/* Empty box to maintain grid */}
          <View style={[styles.detailBox, { backgroundColor: "transparent", borderWidth: 0 }]} />
        </View>

      </View>

    </ScrollView>
  );
}

/* ================================
              STYLES
=================================*/
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#FFFFFF" },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0B2E4F",
  },

  sectionBox: {
    backgroundColor: "#F8F9FC",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0B2E4F",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",   // ⭐ ensures equal height
    marginBottom: 12,
  },

  col: {
    flex: 1,
    marginRight: 10,
  },

  label: {
    fontSize: 12,
    color: "#555",
    fontWeight: "700",
    marginBottom: 2,
  },

  value: {
    fontSize: 14,
    color: "#000",
    flexWrap: "wrap",
  },

  /* Additional Details */
  detailBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  detailLabel: {
    fontSize: 12,
    color: "#777",
    fontWeight: "700",
    marginBottom: 5,
  },

  detailValue: {
    fontSize: 14,
    color: "#111",
    flexWrap: "wrap",
    lineHeight: 18,
  },
});

